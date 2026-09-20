/* =========================================================================
   WIDGETS — chaque page n'affiche qu'un seul élément, pour pouvoir le
   déplacer librement dans OBS. Taille réglable par ?w= et ?h=.
   ========================================================================= */
(function (global) {
  'use strict';
  var BB = global.BB, CFG = BB.cfg;
  var el = BB.el, add = BB.add, esc = BB.esc;
  /* Une page peut figer ses options : BB.widget('logo', { size: 'sm' }).
     Ça évite les chaînes de requête dans les URL, qu'OBS ne sait ni lire en
     mode « Fichier local », ni réparer depuis « Fichiers manquants ».      */
  var OPTS = {};
  var q = function (name, d) {
    return OPTS[name] !== undefined ? OPTS[name] : BB.q(name, d);
  };
  var num = function (name, d) { return parseInt(q(name, d), 10) || d; };

  var BUILD = {
    /* --- fond plein écran (à mettre tout en bas de la pile) ------------- */
    bg: function (host) {
      host.classList.add('no-pad');
      var box = el('div', 'widget-bg');
      add(box, el('div', 'bg-a'), el('div', 'bg-b'), el('div', 'bg-c'));
      if (BB.da === 'signature') {
        var brush = el('canvas');
        brush.width = 1920; brush.height = 1080;
        brush.style.cssText = 'position:absolute;inset:0;width:1920px;height:1080px;';
        BB.paintBrushes(brush, q('seed', 'fond'));
        add(box, brush);
      }
      if (BB.da === 'mono') add(box, el('div', 'mono-grain'));
      return box;
    },

    /* --- marque --------------------------------------------------------- */
    logo:    function () { return BB.logotype(q('size', 'xl')); },
    tagline: function () { return BB.tagline(q('text', null)); },
    socials: function () { return BB.socialRow(); },
    panels:  function () { return BB.profileRows(); },

    /* --- cadres --------------------------------------------------------- */
    cam: function () {
      return BB.nframe(num('w', 400), num('h', 225),
        { hint: false, tab: q('tab', CFG.handle) });
    },
    chat: function () {
      return BB.nframe(num('w', 360), num('h', 560),
        { hint: false, tab: q('tab', (CFG.scenes.chat || {}).tab || 'Chat'),
          tabIcon: 'crown', tabTopLeft: true });
    },
    jeu: function () {
      return BB.nframe(num('w', 1440), num('h', 810),
        { hint: false, tab: q('tab', CFG.live.game) });
    },

    /* --- infos ---------------------------------------------------------- */
    live:  function () { return BB.livePill(q('label', 'en direct')); },
    infos: function () {
      var r = el('div', 'row gap-12');
      add(r, BB.gchip('map', q('map', CFG.live.map)),
             BB.gchip('elo', q('elo', CFG.live.rank)));
      return r;
    },
    timer: function () { return BB.timerChip(num('t', CFG.countdown.starting)); },

    /* Statistiques FACEIT, rafraîchies toutes les 5 minutes */
    faceit: function () {
      var fb = (CFG.faceit || {}).fallback || {};
      /* ?dir=col : les quatre chips empilées, pour un bord d'écran étroit */
      var row = el('div', q('dir', 'row') === 'col' ? 'stack gap-12' : 'row gap-12');
      var cells = {};
      [['elo', 'elo'], ['winrate', 'winrate'], ['hs', '% hs'], ['kd', 'k/d']]
        .forEach(function (pair) {
          var chip = BB.gchip(pair[1], fb[pair[0]] || '—');
          cells[pair[0]] = chip.querySelector('.v');
          add(row, chip);
        });
      function paint(d) {
        Object.keys(cells).forEach(function (k) {
          if (d && d[k]) cells[k].textContent = d[k];
        });
      }
      /* ?demo=1 : valeurs d'exemple, pour caler la position avant le live */
      if (q('demo', '0') === '1') {
        paint({ elo: '2 340', winrate: '58 %', hs: '48 %', kd: '1.24' });
        return row;
      }
      if (global.BB_FACEIT) {
        global.BB_FACEIT.watch(paint, function (e) {
          /* On garde les dernières valeurs connues plutôt que de vider
             l'overlay ; le détail est lisible dans la console d'OBS.      */
          if (global.console) console.warn('[faceit]', e.message);
        });
      }
      return row;
    },

    /* --- phrases -------------------------------------------------------- */
    phrase: function () {
      var scene = q('scene', 'pause');
      var line = q('text', ((CFG.scenes[scene] || {}).line) || '');
      return BB.sceneline(line);
    },

    /* --- alertes -------------------------------------------------------- */
    alertes: function () {
      var stack = el('div', 'alerts-stack');
      (CFG.alerts || []).forEach(function (a) {
        add(stack, BB.alertBar(a.icon, a.label, a.who));
      });
      return stack;
    }
  };

  /* Marge autour du contenu : elle laisse la place aux halos, aux coins
     renforcés et aux étiquettes qui débordent, sinon la source les rogne. */
  var PAD = { logo: 52, bg: 0 };

  BB.widget = function (name, opts) {
    OPTS = opts || {};
    var build = BUILD[name];
    if (!build) throw new Error('widget inconnu : ' + name);
    document.documentElement.setAttribute('data-da', BB.da);
    document.body.classList.add('da-' + BB.da, 'widget', 'widget-' + name);
    var host = el('div', 'widget-host');
    host.style.padding = (PAD[name] === undefined ? 24 : PAD[name]) + 'px';
    document.body.appendChild(host);
    add(host, build(host));
    /* La taille réelle du contenu est mise dans le titre de la page : elle
       s'affiche dans OBS et donne les dimensions à saisir pour la source.  */
    requestAnimationFrame(function () {
      var r = host.getBoundingClientRect();
      document.title = name + ' — ' + Math.ceil(r.width) + ' × ' + Math.ceil(r.height);
    });
    return host;
  };
})(window);
