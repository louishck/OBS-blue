/* =========================================================================
   SCENES — les 9 écrans du pack. Un builder par scène.
   ========================================================================= */
(function (global) {
  'use strict';
  var BB = global.BB, CFG = BB.cfg;
  var el = BB.el, add = BB.add, esc = BB.esc;
  var S = CFG.scenes || {};

  /* Couronne filigrane (fond de la scène de fin) */
  function watermark() {
    var d = document.createElement('div');
    d.innerHTML = '<svg class="watermark" viewBox="0 0 64 44">' +
      '<path d="M2 12.5 12.5 24 26.5 2.5a6 6 0 0 1 11 0L51.5 24 62 12.5l-4 27.5H6L2 12.5Z"/></svg>';
    return d.firstChild;
  }

  function hero(nodes, gap) {
    var h = el('div', 'hero');
    if (gap) h.style.setProperty('--hero-gap', gap + 'px');
    nodes.filter(Boolean).forEach(function (n) { n.classList.add('anim'); add(h, n); });
    return h;
  }

  /* ---------- 1. LIVE — scène principale (jeu) ---------------------------- */
  var CS2_ZONES = [
    { x: 26,   y: 22,  w: 292, h: 292, l: 'radar' },
    { x: 706,  y: 0,   w: 508, h: 116, l: 'score / timer' },
    { x: 1420, y: 60,  w: 480, h: 300, l: 'killfeed' },
    { x: 24,   y: 946, w: 420, h: 112, l: 'vie / armure' },
    { x: 470,  y: 946, w: 400, h: 112, l: 'équipement' },
    { x: 1560, y: 946, w: 336, h: 112, l: 'munitions' }
  ];
  function guides() {
    var g = el('div', 'guides');
    CS2_ZONES.forEach(function (z) {
      var n = el('div', 'zone', '<span>' + esc(z.l) + '</span>');
      n.style.cssText += ';left:' + z.x + 'px;top:' + z.y + 'px;width:' + z.w + 'px;height:' + z.h + 'px;';
      add(g, n);
    });
    return g;
  }

  function liveFull(ctx) {
    var c = CFG.live, root = el('div', 'live-full');
    var tl = el('div', 'lf-top-l anim');
    add(tl, BB.gchip(null, CFG.brand.toUpperCase()), BB.gchip(null, '● live'));
    tl.lastChild.querySelector('.v').style.color = 'var(--live)';
    var tr = el('div', 'lf-top-r anim');
    add(tr, BB.gchip('map', c.map));

    var cam = el('div', 'lf-cam anim');
    add(cam, BB.nframe(400, 225, { hint: 'caméra 400 × 225', tab: CFG.handle }));
    var info = el('div', 'lf-info anim');
    add(info, BB.gchip('elo', c.rank), BB.gchip('mode', c.mode));

    add(root, tl, tr, cam, info);
    add(ctx.content, root);
    if (BB.q('guides', '0') === '1') add(ctx.stage, guides());
  }

  function liveFrame(ctx) {
    var c = CFG.live, root = el('div', 'live-frame');

    var head = el('div', 'lf-head anim');
    add(head, BB.logotype('sm'), BB.tagline());

    var chips = el('div', 'lf-chips anim');
    add(chips, BB.gchip('map', c.map), BB.gchip('elo', c.rank),
      CFG.showClock ? BB.clock() : null);

    var game = el('div', 'lf-game anim');
    add(game, BB.nframe(1440, 810, {
      hint: 'capture du jeu<br>1440 × 810 — position x 40 / y 140',
      tab: c.game
    }));

    var cam = el('div', 'lf-cam anim');
    add(cam, BB.nframe(360, 203, { hint: 'caméra 360 × 203', tab: CFG.handle }));

    var chat = el('div', 'lf-chat anim');
    var cf = BB.nframe(360, 544, { hint: false, tab: 'Chat', tabIcon: 'crown', tabTopLeft: true });
    add(cf, chatLines());
    add(chat, cf);

    var foot = el('div', 'lf-foot anim');
    add(foot, BB.socialRow());

    add(root, head, chips, game, cam, chat, foot);
    add(ctx.content, root);
  }

  function live(ctx) {
    var layout = BB.q('layout', CFG.live.layout || 'fullscreen');
    if (layout === 'frame') liveFrame(ctx); else liveFull(ctx);
  }

  /* ---------- 2. PAUSE ---------------------------------------------------- */
  function pause(ctx) {
    add(ctx.content, hero([
      BB.logotype('xl'),
      BB.sceneline(S.pause.line),
      BB.socialRow()
    ], 42));
  }

  /* ---------- 3. STARTING ------------------------------------------------- */
  function starting(ctx) {
    add(ctx.content, hero([
      BB.logotype('xl'),
      BB.sceneline(S.starting.line),
      BB.timerChip(CFG.countdown.starting)
    ], 40));
  }

  /* ---------- 4. WEBCAM --------------------------------------------------- */
  function webcam(ctx) {
    var w = parseInt(BB.q('w', 1280), 10), h = parseInt(BB.q('h', 720), 10);
    /* l'animation va sur le cadre : le conteneur garde son transform de centrage */
    var box = el('div', 'cam-center');
    var f = BB.nframe(w, h, { hint: 'emplacement caméra<br>' + w + ' × ' + h,
      tab: S.webcam.tab || CFG.brand });
    f.classList.add('anim');
    add(box, f);
    add(ctx.content, box);
  }

  /* ---------- 5. ENDING --------------------------------------------------- */
  function ending(ctx) {
    add(ctx.content, watermark());
    add(ctx.content, hero([
      BB.logotype('xl'),
      BB.sceneline(S.ending.line),
      BB.socialRow()
    ], 42));
  }

  /* ---------- 6. ALERTS --------------------------------------------------- */
  function alerts(ctx) {
    var pos = el('div', 'alerts-pos ' + BB.q('pos', ''));
    var stack = el('div', 'alerts-stack');
    (CFG.alerts || []).forEach(function (a) {
      var bar = BB.alertBar(a.icon, a.label, a.who);
      bar.classList.add('anim');
      add(stack, bar);
    });
    add(pos, stack);
    add(ctx.content, pos);
  }

  /* ---------- 7. CHAT ----------------------------------------------------- */
  function chatLines(list) {
    var n = el('div', 'chat-lines');
    add(n, el('div', 'sys', 'zone réservée au widget de chat'));
    (list || CFG.chatSample || []).forEach(function (m) {
      add(n, el('div', 'msg', '<span class="u">' + esc(m.u) + '</span> ' + esc(m.m)));
    });
    return n;
  }
  function chat(ctx) {
    var w = parseInt(BB.q('w', 420), 10), h = parseInt(BB.q('h', 760), 10);
    var pos = el('div', 'chat-pos ' + BB.q('pos', ''));
    var f = BB.nframe(w, h, { hint: false, tab: S.chat.tab || 'Chat',
      tabIcon: 'crown', tabTopLeft: true });
    f.classList.add('anim');
    add(f, chatLines());
    add(pos, f);
    add(ctx.content, pos);
  }

  /* ---------- 8. OFFLINE -------------------------------------------------- */
  function offline(ctx) {
    add(ctx.content, hero([
      BB.logotype('xl'),
      BB.sceneline(S.offline.line),
      el('div', 'sub-note', esc(S.offline.sub || '')),
      BB.socialRow()
    ], 34));
  }

  /* ---------- 9. PANELS --------------------------------------------------- */
  function panels(ctx) {
    var pos = el('div', 'panels-pos');
    var lg = BB.logotype('md'); lg.classList.add('anim');
    var rows = BB.profileRows(); rows.classList.add('anim');
    add(pos, lg, rows);
    add(ctx.content, pos);
  }

  /* ---------- Table des scènes -------------------------------------------- */
  var SCENES = {
    live:     { build: live,     opaque: false },
    pause:    { build: pause,    opaque: true },
    starting: { build: starting, opaque: true },
    webcam:   { build: webcam,   opaque: false },
    ending:   { build: ending,   opaque: true },
    alerts:   { build: alerts,   opaque: false },
    chat:     { build: chat,     opaque: false },
    offline:  { build: offline,  opaque: true },
    panels:   { build: panels,   opaque: true }
  };

  BB.render = function (name) {
    var s = SCENES[name];
    if (!s) throw new Error('scène inconnue : ' + name);
    var opaque = s.opaque;
    if (name === 'live') opaque = BB.q('layout', CFG.live.layout || 'fullscreen') === 'frame';
    var ctx = BB.boot(name, { opaque: opaque, decorate: opaque });
    s.build(ctx);
    BB.stagger(ctx.content);
    return ctx;
  };
  BB.SCENES = SCENES;
})(window);
