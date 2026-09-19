/* =========================================================================
   FACEIT — récupère ELO, winrate, % HS et K/D d'un joueur, et les rafraîchit.

   Deux sources possibles :
   • sans clé : les points d'entrée publics du site FACEIT (ceux qu'utilise
     faceit.com lui-même) ;
   • avec une clé de l'API officielle (developers.faceit.com) : plus stable.

   Les noms de champs changent d'une version d'API à l'autre, donc on ne se
   fie pas à un chemin précis : on cherche les valeurs par motif dans tout le
   JSON reçu. Ce qui a été lu une fois est gardé en cache : si le réseau
   tombe pendant un live, l'overlay continue d'afficher les dernières valeurs
   au lieu de se vider.
   ========================================================================= */
(function (global) {
  'use strict';
  var CFG = (global.BB_CONFIG || {}).faceit || {};
  var CACHE_KEY = 'bb-faceit-' + (CFG.nickname || '') + '-' + (CFG.game || 'cs2');

  function url(u) {
    return CFG.proxy ? CFG.proxy + encodeURIComponent(u) : u;
  }
  function getJSON(u, headers) {
    return fetch(url(u), { headers: headers || {}, cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' sur ' + u);
        return r.json();
      });
  }

  /* ---- recherche d'une valeur par motif, à n'importe quelle profondeur --- */
  function deepFind(obj, re, depth) {
    if (!obj || typeof obj !== 'object' || (depth || 0) > 6) return undefined;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var v = obj[keys[i]];
      if (re.test(keys[i]) && (typeof v === 'number' || typeof v === 'string') && v !== '') return v;
    }
    for (var j = 0; j < keys.length; j++) {
      var found = deepFind(obj[keys[j]], re, (depth || 0) + 1);
      if (found !== undefined) return found;
    }
    return undefined;
  }

  var FIELDS = {
    elo:     /faceit_elo|^elo$|^elo /i,
    winrate: /win\s*rate/i,
    hs:      /head\s*shot/i,
    kd:      /k\s*\/?\s*d(\s|_)*(ratio)?$/i
  };

  function extract(blobs) {
    var out = {};
    Object.keys(FIELDS).forEach(function (k) {
      for (var i = 0; i < blobs.length; i++) {
        var v = deepFind(blobs[i], FIELDS[k]);
        if (v !== undefined) { out[k] = v; break; }
      }
    });
    return out;
  }

  /* ---- mise en forme ---------------------------------------------------- */
  function fmt(kind, v) {
    if (v === undefined || v === null || v === '') return null;
    var n = parseFloat(String(v).replace(',', '.'));
    if (isNaN(n)) return String(v);
    if (kind === 'elo') return String(Math.round(n));
    if (kind === 'kd') return n.toFixed(2);
    return Math.round(n) + ' %';        // winrate et % HS
  }

  /* ---- lecture / écriture du cache -------------------------------------- */
  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || null; } catch (e) { return null; }
  }
  function writeCache(d) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch (e) { /* onglet privé */ }
  }

  /* ---- les deux modes ---------------------------------------------------- */
  function fetchOfficial(nick, game, key) {
    var h = { Authorization: 'Bearer ' + key };
    return getJSON('https://open.faceit.com/data/v4/players?nickname=' +
        encodeURIComponent(nick) + '&game=' + game, h)
      .then(function (player) {
        var id = player.player_id;
        return getJSON('https://open.faceit.com/data/v4/players/' + id + '/stats/' + game, h)
          .then(function (stats) { return [player, stats]; })
          .catch(function () { return [player]; });      // au moins l'elo
      });
  }

  function fetchPublic(nick, game) {
    return getJSON('https://www.faceit.com/api/users/v1/nicknames/' + encodeURIComponent(nick))
      .then(function (res) {
        var p = res.payload || res;
        var id = p.id || p.guid;
        if (!id) throw new Error('joueur introuvable : ' + nick);
        return getJSON('https://api.faceit.com/stats/v1/stats/users/' + id + '/games/' + game)
          .then(function (stats) { return [p, stats]; })
          .catch(function () { return [p]; });
      });
  }

  /* ---- API publique du module -------------------------------------------- */
  function load() {
    var nick = CFG.nickname, game = CFG.game || 'cs2';
    if (!nick) return Promise.reject(new Error('aucun pseudo FACEIT dans config.js'));
    var run = CFG.apiKey ? fetchOfficial(nick, game, CFG.apiKey) : fetchPublic(nick, game);
    return run.then(function (blobs) {
      var raw = extract(blobs);
      var data = {
        elo: fmt('elo', raw.elo),
        winrate: fmt('winrate', raw.winrate),
        hs: fmt('hs', raw.hs),
        kd: fmt('kd', raw.kd),
        at: Date.now()
      };
      if (data.elo || data.winrate || data.hs || data.kd) writeCache(data);
      return { data: data, blobs: blobs };
    });
  }

  global.BB_FACEIT = {
    load: load,
    cached: readCache,
    /* Appelle onData à chaque rafraîchissement ; renvoie de suite le cache. */
    watch: function (onData, onError) {
      var cached = readCache();
      if (cached) onData(cached, 'cache');
      function tick() {
        load().then(function (r) { onData(r.data, 'réseau'); })
              .catch(function (e) { if (onError) onError(e); });
      }
      tick();
      setInterval(tick, Math.max(60, CFG.refreshSeconds || 300) * 1000);
    }
  };
})(window);
