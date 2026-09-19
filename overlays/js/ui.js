/* =========================================================================
   BB — moteur commun des overlays (script classique, compatible file://)
   Expose window.BB : paramètres d'URL, helpers DOM, composants, effets.
   ========================================================================= */
(function (global) {
  'use strict';

  var CFG = global.BB_CONFIG || {};
  var DAS = ['cobalt', 'signature', 'mono'];

  /* ---------- Paramètres d'URL ---------------------------------------- */
  var Q = new URLSearchParams(location.search);
  function q(name, fallback) {
    var v = Q.get(name);
    return (v === null || v === '') ? fallback : v;
  }
  var da = q('da', CFG.da || 'cobalt');
  if (DAS.indexOf(da) === -1) da = 'cobalt';
  var fx = q('fx', CFG.fx || 'high');
  var fitEnabled = q('fit', '1') !== '0';

  /* ---------- Helpers DOM ---------------------------------------------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined && html !== null) n.innerHTML = html;
    return n;
  }
  function add(parent) {
    for (var i = 1; i < arguments.length; i++) {
      if (arguments[i]) parent.appendChild(arguments[i]);
    }
    return parent;
  }
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function stagger(root, from) {
    var i = from || 0;
    [].forEach.call(root.querySelectorAll('.anim,.anim-fade,.anim-wipe'), function (n) {
      if (!n.style.getPropertyValue('--i')) n.style.setProperty('--i', i++);
    });
  }

  /* ---------- Chargement du thème + polices ---------------------------- */
  function head(tag, attrs) {
    var n = document.createElement(tag);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    document.head.appendChild(n);
    return n;
  }
  /* Ordre volontaire : base -> feuilles de scène -> thème (le thème gagne). */
  function loadTheme(base, extra) {
    base = base || '';
    extra = extra || ['css/components.css', 'css/scenes.css'];
    head('link', { rel: 'stylesheet', href: base + 'css/fonts.css' });
    head('link', { rel: 'stylesheet', href: base + 'css/base.css' });
    extra.forEach(function (href) { head('link', { rel: 'stylesheet', href: base + href }); });
    head('link', { rel: 'stylesheet', href: base + 'css/themes/' + da + '.css' });
  }

  /* ---------- Mise à l'échelle (aperçu navigateur) ---------------------- */
  function fit() {
    if (!fitEnabled) return;
    var s = Math.min(global.innerWidth / 1920, global.innerHeight / 1080);
    document.documentElement.style.setProperty('--fit', s);
  }

  /* ---------- Icônes ---------------------------------------------------- */
  var ICONS = {
    twitch: '<path d="M4 2 2 6v14h5v3h3l3-3h4l5-5V2H4Zm16 12-3 3h-4l-3 3v-3H6V4h14v10Z"/><path d="M15 7h2v6h-2zM10 7h2v6h-2z"/>',
    youtube: '<path d="M23 12s0-3.6-.5-5.3a2.9 2.9 0 0 0-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.7a2.9 2.9 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.5 5.3a2.9 2.9 0 0 0 2 2C5.3 20 12 20 12 20s6.7 0 8.5-.7a2.9 2.9 0 0 0 2-2C23 15.6 23 12 23 12ZM9.8 15.4V8.6l5.9 3.4-5.9 3.4Z"/>',
    x: '<path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-6.9L4.8 22H1.4l7.9-9L1 2h7l4.8 6.3L18.2 2Zm-1.2 18h1.9L7.1 3.9H5L17 20Z"/>',
    discord: '<path d="M19.3 5.3A16.6 16.6 0 0 0 15.2 4l-.3.6a15 15 0 0 0-5.8 0L8.8 4a16.6 16.6 0 0 0-4.1 1.3C2.1 9.2 1.4 13 1.7 16.7a16.7 16.7 0 0 0 5.1 2.6l1.1-1.7a11 11 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.8 0l.4.3a11 11 0 0 1-1.7.8l1.1 1.7a16.7 16.7 0 0 0 5.1-2.6c.4-4.3-.7-8.1-3-11.4ZM8.5 14.4c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2c0 1.1-.8 2-1.8 2Zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2c0 1.1-.8 2-1.8 2Z"/>',
    instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.1.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.1-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9a3.7 3.7 0 0 1-.9-1.4c-.1-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.1 1-.3 2.2-.4 1.3-.1 1.7-.1 4.8-.1Zm0 5.8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Zm5.1-6.8a.9.9 0 1 1-1.9 0 .9.9 0 0 1 1.9 0Z"/>',
    tiktok: '<path d="M16.5 2h-3v13.4a2.6 2.6 0 1 1-2.2-2.6v-3a5.6 5.6 0 1 0 5.2 5.6V9.3a7 7 0 0 0 4.1 1.3v-3a4.1 4.1 0 0 1-4.1-4.1V2Z"/>',
    kick: '<path d="M3 3h5v5h2V5.5h2V3h6v5.5h-2V11h-2v2h2v2.5h2V21h-6v-2.5h-2V16H8v5H3V3Z"/>',
    heart: '<path d="M12 21s-8.5-5.3-8.5-11A4.8 4.8 0 0 1 12 6.6 4.8 4.8 0 0 1 20.5 10c0 5.7-8.5 11-8.5 11Z"/>',
    star: '<path d="m12 2 3 6.6 7 .8-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.8L12 2Z"/>',
    euro: '<path d="M16.8 18.3a6.6 6.6 0 0 1-9.9-3.8H5.4v-1.8h1.2a7.7 7.7 0 0 1 0-1.4H5.4V9.5h1.5A6.6 6.6 0 0 1 16.8 5.7l-1.5 1.6a4.4 4.4 0 0 0-6.2 2.2h5.3v1.8H8.7a5.6 5.6 0 0 0 0 1.4h5.7v1.8H9.1a4.4 4.4 0 0 0 6.2 2.2l1.5 1.6Z"/>',
    gem: '<path d="M7 3h10l4 6-9 12L3 9l4-6Zm.6 2L5.3 8.6h4L11 5H7.6Zm5.4 0 1.7 3.6h4L16.4 5H13ZM12 6.6 10.3 10h3.4L12 6.6ZM5.6 10.4 11 17.9V10.4H5.6Zm7.4 0v7.5l5.4-7.5H13Z"/>',
    clock: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm1-13h-2v6l5 3 1-1.7-4-2.3V7Z"/>',
    chevron: '<path d="M9 5.5 15.5 12 9 18.5 7.6 17l5-5-5-5L9 5.5Z"/>',
    crown: '<path d="M2.6 6.2 6 10.8 10.8 2l4.8 8.8 3.4-4.6L21 19H3L2.6 6.2Zm2.9 10.9h13L19 9.9l-2.7 3.6-4.5-8.2-4.5 8.2L4.6 9.9l.9 7.2Z"/>'
  };
  function icon(name) {
    var p = ICONS[name] || ICONS.twitch;
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
  }

  /* ---------- Composants ------------------------------------------------ */
  function brandmark(opts) {
    opts = opts || {};
    var n = el('div', 'brandmark ' + (opts.cls || ''));
    var mark = el('div', 'mark', esc(CFG.brandShort || 'BB'));
    var box = el('div');
    add(box, el('div', 'wordmark', esc(CFG.brand || '')));
    if (opts.tagline !== false) add(box, el('div', 'tag', esc(CFG.tagline || '')));
    return add(n, mark, box);
  }

  function clock() {
    var n = el('div', 'pill num');
    var t = el('span');
    add(n, t);
    function tick() {
      t.textContent = new Date().toLocaleTimeString(CFG.locale || 'fr-FR',
        { hour: '2-digit', minute: '2-digit' });
    }
    tick(); setInterval(tick, 1000 * 10);
    return n;
  }

  function livePill(label) {
    var n = el('div', 'pill');
    add(n, el('span', 'live-dot'), el('span', null, esc(label || 'EN DIRECT')));
    return n;
  }

  function ticker(items, dur) {
    items = items && items.length ? items : (CFG.ticker || []);
    var n = el('div', 'ticker');
    var track = el('div', 'track');
    // deux copies pour un défilement infini sans saut
    for (var pass = 0; pass < 2; pass++) {
      items.forEach(function (txt) { add(track, el('div', 'item', esc(txt))); });
    }
    n.style.setProperty('--marquee-dur', (dur || Math.max(24, items.length * 8)) + 's');
    return add(n, track);
  }

  function socials(list) {
    var n = el('div', 'socials');
    (list || CFG.socials || []).forEach(function (s) {
      var i = el('div', 'social', icon(s.icon) + '<span>' + esc(s.label) + '</span>');
      add(n, i);
    });
    return n;
  }

  function events(list) {
    var n = el('div', 'events');
    var LAB = { follow: 'follow', sub: 'sub', tip: 'don', raid: 'raid', cheer: 'bits' };
    (list || CFG.events || []).forEach(function (e) {
      var row = el('div', 'event');
      add(row,
        el('span', 'badge', esc(LAB[e.type] || e.type)),
        el('span', 'who', esc(e.who)),
        el('span', null, esc(e.what)));
      add(n, row);
    });
    return n;
  }

  /* Compte à rebours : renvoie {node, onEnd} */
  function countdown(seconds, opts) {
    opts = opts || {};
    var total = Math.max(0, parseInt(q('t', seconds), 10) || 0);
    var left = total;
    var wrap = el('div', 'stack gap-16');
    var line = el('div', 'countdown');
    var time = el('div', 'time num', '00:00');
    var unit = el('div', 'unit', opts.unit || 'avant le live');
    add(line, time, unit);
    var bar = el('div', 'progress');
    var fill = el('i');
    add(bar, fill);
    add(wrap, line, opts.progress === false ? null : bar);

    function fmt(s) {
      var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
      var pad = function (v) { return (v < 10 ? '0' : '') + v; };
      return (h > 0 ? pad(h) + ':' : '') + pad(m) + ':' + pad(x);
    }
    function render() {
      time.textContent = fmt(left);
      fill.style.width = total ? ((total - left) / total * 100) + '%' : '0%';
      if (left <= 0) {
        time.style.animation = 'blink 1.2s infinite';
        unit.textContent = opts.endUnit || 'ça démarre';
        return;
      }
      left--;
      setTimeout(render, 1000);
    }
    render();
    return wrap;
  }

  function cam(w, h, label, hint) {
    var n = el('div', 'cam');
    n.style.width = w + 'px'; n.style.height = h + 'px';
    add(n, el('div', 'cam-hint', hint || 'emplacement caméra<br>' + w + ' × ' + h));
    if (label !== false) add(n, el('div', 'cam-label', esc(label || CFG.handle || '')));
    return n;
  }

  function chip(k, v) {
    var n = el('div', 'hud-chip');
    if (k) add(n, el('span', 'k', esc(k)));
    add(n, el('span', 'v', esc(v)));
    return n;
  }


  /* ======================= COMPOSANTS DU PACK ========================== */

  /* Couronne pleine, dessinée à part du jeu d'icônes (traits pleins) */
  var CROWN_SVG = '<svg class="crown" viewBox="0 0 64 44" aria-hidden="true">' +
    '<path d="M2 12.5 12.5 24 26.5 2.5a6 6 0 0 1 11 0L51.5 24 62 12.5l-4 27.5H6L2 12.5Z"/>' +
    '<circle cx="2.5" cy="9.5" r="2.5"/><circle cx="61.5" cy="9.5" r="2.5"/>' +
    '<circle cx="32" cy="2.5" r="2.5"/></svg>';

  function logotype(size) {
    var n = el('div', 'logotype ' + (size || ''));
    n.innerHTML = CROWN_SVG + '<div class="word">' + esc(CFG.brand || '') + '</div>';
    return n;
  }

  /* « STREAM // GAMING // GOOD VIBES » */
  function tagline(txt) {
    var parts = String(txt || CFG.tagline || '').split(/\s*\/\/\s*/);
    var n = el('div', 'tagline');
    parts.forEach(function (p, i) {
      if (i) add(n, el('i', null, '//'));
      add(n, el('span', null, esc(p)));
    });
    return n;
  }

  /* « *PAUSE* / JE REVIENS BIENTÔT » : « / » = séparateur, *mot* = accent */
  function sceneline(txt) {
    var n = el('div', 'sceneline');
    String(txt || '').split('/').forEach(function (part, i) {
      if (i) add(n, el('span', 'sep', '/'));
      part.trim().split('*').forEach(function (chunk, j) {
        if (!chunk) return;
        add(n, el('span', j % 2 ? 'hi' : null, esc(chunk)));
      });
    });
    return n;
  }

  /* Cadre néon : coins renforcés + étiquette */
  function nframe(w, h, opts) {
    opts = opts || {};
    var n = el('div', 'nframe' + (opts.tabTopLeft ? ' tab-tl' : ''));
    n.style.width = w + 'px'; n.style.height = h + 'px';
    ['tl', 'tr', 'bl', 'br'].forEach(function (c) { add(n, el('div', 'corner ' + c)); });
    if (opts.hint !== false) add(n, el('div', 'hint', opts.hint || (w + ' × ' + h)));
    if (opts.tab !== false) {
      var tab = el('div', 'tab');
      tab.innerHTML = (opts.tabIcon ? icon(opts.tabIcon) : '') +
        '<span>' + esc(opts.tab || CFG.brand) + '</span>';
      add(n, tab);
    }
    return n;
  }

  /* Barre d'alerte : pastille + bandeau biseauté */
  function alertBar(ico, label, who) {
    var n = el('div', 'alertbar');
    var box = el('div', 'ico');
    box.innerHTML = icon(ico);
    var bar = el('div', 'bar');
    add(bar, el('span', null, esc(label)));
    if (who) add(bar, el('span', 'who', esc(who)));
    return add(n, box, bar);
  }

  /* Panneau profil / réseaux */
  function profileRows(list) {
    var n = el('div', 'panel-rows');
    (list || CFG.panels || CFG.socials || []).forEach(function (s) {
      var row = el('div', 'prow');
      var box = el('div', 'box'); box.innerHTML = icon(s.icon);
      var chev = document.createElement('div');
      chev.innerHTML = '<svg class="chev" viewBox="0 0 24 24">' + ICONS.chevron + '</svg>';
      add(row, box, el('div', 'lbl', esc(s.label)), chev.firstChild);
      add(n, row);
    });
    return n;
  }

  /* Chip minuterie hexagonale */
  function timerChip(seconds, opts) {
    opts = opts || {};
    var total = Math.max(0, parseInt(q('t', seconds), 10) || 0);
    var left = total;
    var n = el('div', 'timerchip');
    n.innerHTML = icon('clock');
    var t = el('span', 'num', '00:00');
    add(n, t);
    function fmt(s) {
      var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
      var pad = function (v) { return (v < 10 ? '0' : '') + v; };
      return (h > 0 ? pad(h) + ':' : '') + pad(m) + ':' + pad(x);
    }
    (function tick() {
      t.textContent = fmt(left);
      if (left <= 0) { n.style.animation = 'blink 1.3s infinite'; return; }
      left--; setTimeout(tick, 1000);
    })();
    return n;
  }

  /* Rangée de réseaux (pastille + pseudo) */
  function socialRow(list) {
    var n = el('div', 'social-row');
    (list || CFG.socials || []).forEach(function (s) {
      var i = el('div', 's');
      var box = el('div', 'box'); box.innerHTML = icon(s.icon);
      add(i, box, el('span', 'name', esc(s.label)));
      add(n, i);
    });
    return n;
  }

  /* Chip d'info en jeu */
  function gchip(k, v) {
    var n = el('div', 'gchip');
    if (k) add(n, el('span', 'k', esc(k)));
    add(n, el('span', 'v', esc(v)));
    return n;
  }

  /* ---------- Décor propre à chaque DA ---------------------------------- */
  function decorate(stageEl, sceneName) {
    var bg = el('div', 'layer layer-bg');
    add(bg, el('div', 'bg-a'), el('div', 'bg-b'), el('div', 'bg-c'));
    var fxl = el('div', 'layer layer-fx');

    if (da === 'cobalt') {
      add(fxl, el('div', 'cobalt-slash'), el('div', 'cobalt-slash right'));
    }
    if (da === 'signature') {
      var brush = el('canvas', 'brush');
      brush.width = 1920; brush.height = 1080;
      brush.style.cssText = 'position:absolute;inset:0;width:1920px;height:1080px;';
      paintBrushes(brush, sceneName);
      add(bg, brush);
    }
    if (da === 'mono') {
      add(fxl, el('div', 'mono-grain'));
    }

    var cv = el('canvas', 'fx');
    cv.width = 1920; cv.height = 1080;
    cv.style.cssText = 'position:absolute;inset:0;width:1920px;height:1080px;';
    add(fxl, cv);
    add(stageEl, bg, fxl);
    if (fx !== 'low') startFx(cv);
    return { bg: bg, fx: fxl };
  }


  /* ---------- Coups de pinceau (DA signature) --------------------------- */
  function rng(seed) {                    // générateur déterministe
    var x = seed || 1;
    return function () { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; };
  }
  function stroke(c, r, x, y, len, w, ang, col, alpha) {
    var dx = Math.cos(ang), dy = Math.sin(ang);
    var px = -dy, py = dx;                // perpendiculaire
    var steps = 9, top = [], bot = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      // largeur quasi constante, biseau franc aux extrémités
      var taper = Math.min(1, Math.pow(Math.min(t, 1 - t) / .16, .5));
      var jag = (r() - .5) * w * .34;
      var hw = Math.max(2, w * .5 * (.34 + .66 * taper) + jag * .3);
      var cx = x + dx * len * t, cy = y + dy * len * t;
      top.push([cx + px * hw, cy + py * hw]);
      bot.push([cx - px * hw, cy - py * hw]);
    }
    c.beginPath();
    top.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); });
    for (var j = bot.length - 1; j >= 0; j--) c.lineTo(bot[j][0], bot[j][1]);
    c.closePath();
    c.fillStyle = col; c.globalAlpha = alpha; c.fill(); c.globalAlpha = 1;
    /* éclats projetés */
    var shards = 1 + Math.floor(r() * 3);
    for (var k = 0; k < shards; k++) {
      var t2 = .1 + r() * .9;
      var off = (r() - .5) * w * 3.6;
      var sx = x + dx * len * t2 + px * off, sy = y + dy * len * t2 + py * off;
      var sl = 40 + r() * 190, sw = 4 + r() * 14;
      c.save(); c.translate(sx, sy); c.rotate(ang);
      c.globalAlpha = alpha * (.4 + r() * .5);
      c.fillStyle = col;
      c.fillRect(0, -sw / 2, sl, sw);
      c.restore();
    }
    c.globalAlpha = 1;
  }
  function paintBrushes(cv, seedName) {
    var c = cv.getContext('2d');
    var seed = 7;
    for (var i = 0; i < String(seedName || '').length; i++) seed = seed * 31 + String(seedName).charCodeAt(i);
    var r = rng(Math.abs(seed) % 100000 + 11);
    var COLS = ['#0d2f7a', '#1f6bff', '#3b86ff', '#0a2059', '#5aa0ff'];
    var ANG = -1.12;                       // ≈ -64°, comme la référence
    /* grappes : bord gauche, bord droit, coin bas-droit */
    var clusters = [
      { x: -60,  y: 1180, n: 7,  spread: 520, len: [520, 1180], w: [26, 92] },
      { x: 1520, y: 1220, n: 8,  spread: 620, len: [560, 1240], w: [24, 104] },
      { x: 420,  y: -120, n: 3,  spread: 380, len: [300, 620],  w: [14, 44] },
      { x: 1180, y: 1260, n: 4,  spread: 420, len: [260, 560],  w: [12, 40] }
    ];
    clusters.forEach(function (cl) {
      for (var i = 0; i < cl.n; i++) {
        var x = cl.x + (r() - .5) * cl.spread;
        var y = cl.y + (r() - .5) * cl.spread * .55;
        var len = cl.len[0] + r() * (cl.len[1] - cl.len[0]);
        var w = cl.w[0] + r() * (cl.w[1] - cl.w[0]);
        var col = COLS[Math.floor(r() * COLS.length)];
        stroke(c, r, x, y, len, w, ANG + (r() - .5) * .12, col, .22 + r() * .5);
      }
    });
    /* voile sombre au centre pour garder le texte lisible */
    var g = c.createRadialGradient(960, 520, 120, 960, 520, 1180);
    g.addColorStop(0, 'rgba(4,6,14,.72)');
    g.addColorStop(.55, 'rgba(4,6,14,.35)');
    g.addColorStop(1, 'rgba(4,6,14,0)');
    c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
  }

  /* ---------- Effets canvas --------------------------------------------- */
  function startFx(cv) {
    var c = cv.getContext('2d');
    var t = 0, raf;

    var particles = [];
    for (var i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * 1920, y: Math.random() * 1080,
        r: Math.random() * 2.2 + .4,
        vy: -(Math.random() * .35 + .08),
        vx: (Math.random() - .5) * .12,
        a: Math.random() * .5 + .15
      });
    }
    var nodes = [];
    for (var j = 0; j < 26; j++) {
      nodes.push({ x: Math.round(Math.random() * 11) * 160 + 40,
                   y: Math.round(Math.random() * 6) * 160 + 40,
                   p: Math.random() * Math.PI * 2 });
    }

    function frame() {
      t += 1 / 60;
      c.clearRect(0, 0, 1920, 1080);

      if (da === 'cobalt') {
        particles.forEach(function (p) {
          p.y += p.vy; p.x += p.vx;
          if (p.y < -10) { p.y = 1090; p.x = Math.random() * 1920; }
          c.beginPath();
          c.fillStyle = 'rgba(91,227,255,' + (p.a * (.5 + .5 * Math.sin(t + p.x))) + ')';
          c.arc(p.x, p.y, p.r, 0, 6.284); c.fill();
        });
        var sweep = (t * 160) % 2600 - 400;
        var g = c.createLinearGradient(sweep - 260, 0, sweep + 260, 0);
        g.addColorStop(0, 'rgba(47,123,255,0)');
        g.addColorStop(.5, 'rgba(91,227,255,.055)');
        g.addColorStop(1, 'rgba(47,123,255,0)');
        c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
      }

      if (da === 'signature') {
        particles.forEach(function (p) {
          p.y += p.vy * .7; p.x += p.vx;
          if (p.y < -10) { p.y = 1090; p.x = Math.random() * 1920; }
          c.beginPath();
          c.fillStyle = 'rgba(97,166,255,' + (p.a * .55 * (.5 + .5 * Math.sin(t + p.x))) + ')';
          c.arc(p.x, p.y, p.r * .9, 0, 6.284); c.fill();
        });
      }

      if (da === 'mono') {
        c.save();
        c.translate(1560, 880);
        c.rotate(t * .06);
        c.strokeStyle = 'rgba(250,250,250,.16)';
        c.lineWidth = 2;
        c.beginPath(); c.arc(0, 0, 320, 0, 6.284); c.stroke();
        for (var k = 0; k < 48; k++) {
          var a2 = k / 48 * 6.284;
          var r1 = k % 4 === 0 ? 292 : 306;
          c.beginPath();
          c.moveTo(Math.cos(a2) * r1, Math.sin(a2) * r1);
          c.lineTo(Math.cos(a2) * 320, Math.sin(a2) * 320);
          c.stroke();
        }
        c.restore();
      }

      raf = requestAnimationFrame(frame);
    }
    frame();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf); else frame();
    });
  }

  /* ---------- Amorçage --------------------------------------------------- */
  function boot(sceneName, opts) {
    opts = opts || {};
    document.documentElement.setAttribute('data-da', da);
    document.body.classList.add('da-' + da, 'scene-' + sceneName);
    if (fx === 'low') document.body.classList.add('fx-low');

    var stage = el('div', 'stage' + (opts.opaque === false ? '' : ' opaque'));
    // ?bg=demo : fond factice pour visualiser un overlay transparent hors OBS
    if (q('bg', '') === 'demo' && opts.opaque === false) stage.classList.add('demo-bg');
    document.body.appendChild(stage);
    if (opts.decorate !== false) decorate(stage, sceneName);

    var content = el('div', 'layer layer-content');
    add(stage, content);
    fit();
    global.addEventListener('resize', fit);
    return { stage: stage, content: content };
  }

  global.BB = {
    cfg: CFG, da: da, fx: fx, q: q,
    el: el, add: add, esc: esc, stagger: stagger,
    loadTheme: loadTheme, boot: boot, fit: fit,
    brandmark: brandmark, clock: clock, livePill: livePill, ticker: ticker,
    socials: socials, events: events, countdown: countdown, cam: cam,
    chip: chip, icon: icon,
    logotype: logotype, tagline: tagline, sceneline: sceneline, nframe: nframe,
    alertBar: alertBar, profileRows: profileRows, timerChip: timerChip,
    socialRow: socialRow, gchip: gchip
  };
})(window);
