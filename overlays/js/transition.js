/* =========================================================================
   TRANSITION (stinger) — rendu canvas déterministe.
   draw(p) avec p ∈ [0,1] : 0 = écran libre, 0.5 = écran couvert, 1 = libre.
   Mode aperçu : boucle temps réel. Mode rendu : ?p=0.42 (une image fixe).
   ========================================================================= */
(function (global) {
  'use strict';

  var CFG = global.BB_CONFIG || {};
  var Q = new URLSearchParams(location.search);
  var da = Q.get('da') || CFG.da || 'cobalt';
  var W = 1920, H = 1080;
  var COVER = 0.5;            // point de transition
  var DUR = parseInt(Q.get('dur') || '1100', 10);

  var PALETTE = {
    cobalt: {
      layers: ['#5be3ff', '#2f7bff', '#050a18'],
      ink: '#eef4ff', accent: '#5be3ff',
      font: '700 76px "Chakra Petch", system-ui, sans-serif',
      mono: '600 20px "JetBrains Mono", monospace'
    },
    signature: {
      layers: ['#3b86ff', '#123a8f', '#04060e'],
      ink: '#f4f8ff', accent: '#61a6ff',
      font: '400 150px "Kaushan Script", cursive',
      mono: '600 20px "Inter", system-ui, sans-serif'
    },
    mono: {
      layers: ['#fafafa', '#0a0a0a', '#0a0a0a'],
      ink: '#fafafa', accent: '#fafafa',
      font: '900 86px "Archivo", system-ui, sans-serif',
      mono: '600 20px "JetBrains Mono", monospace'
    }
  };

  /* ---------- easing ---------------------------------------------------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function inCubic(t) { return t * t * t; }
  function inOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* Progression d'une couche : 0 -> hors champ gauche, 1 -> hors champ droit */
  function sweep(p, delay) {
    var d = delay || 0;
    if (p <= COVER) {
      var t = clamp((p / COVER - d) / (1 - d), 0, 1);
      return { phase: 'in', k: outCubic(t) };
    }
    var t2 = clamp((((p - COVER) / (1 - COVER)) - d) / (1 - d), 0, 1);
    return { phase: 'out', k: inCubic(t2) };
  }

  /* ---------- Formes ----------------------------------------------------- */
  function slantPanel(c, x, w, slant, fill) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x + w, 0);
    c.lineTo(x + w - slant, H);
    c.lineTo(x - slant, H);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  }

  function centerText(c, text, font, color, y, spacing) {
    c.font = font;
    c.fillStyle = color;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    if (!spacing) { c.fillText(text, W / 2, y); return; }
    var chars = text.split('');
    var total = 0;
    chars.forEach(function (ch) { total += c.measureText(ch).width + spacing; });
    total -= spacing;
    var x = W / 2 - total / 2;
    chars.forEach(function (ch) {
      var w = c.measureText(ch).width;
      c.fillText(ch, x + w / 2, y);
      x += w + spacing;
    });
  }

  /* Opacité du bloc de marque : visible uniquement écran couvert */
  function brandAlpha(p) {
    if (p < COVER - .14 || p > COVER + .20) return 0;
    if (p < COVER) return clamp((p - (COVER - .14)) / .14, 0, 1);
    return clamp(1 - (p - COVER) / .20, 0, 1);
  }

  /* ---------- DA 1 : COBALT ---------------------------------------------- */
  function drawCobalt(c, p) {
    var P = PALETTE.cobalt, S = 300, w = W + S;
    var delays = [0, .12, .22];

    P.layers.forEach(function (col, i) {
      var s = sweep(p, delays[i]);
      var x = s.phase === 'in' ? -w + s.k * w : s.k * w;
      slantPanel(c, x, w, S, col);
      if (i === 2) {                       // profondeur dans la couche sombre
        c.save();
        c.beginPath();
        c.moveTo(x, 0); c.lineTo(x + w, 0); c.lineTo(x + w - S, H); c.lineTo(x - S, H);
        c.closePath(); c.clip();
        var rg = c.createRadialGradient(960, 470, 40, 960, 470, 1080);
        rg.addColorStop(0, 'rgba(47,123,255,.34)');
        rg.addColorStop(.55, 'rgba(20,52,120,.16)');
        rg.addColorStop(1, 'rgba(4,6,13,0)');
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
        c.fillStyle = 'rgba(91,227,255,.05)';
        for (var sy = 0; sy < H; sy += 5) c.fillRect(0, sy, W, 1);
        c.restore();
      }
      // liseré lumineux sur l'arête avant
      var edge = s.phase === 'in' ? x + w : x;
      var g = c.createLinearGradient(edge - 120, 0, edge + 20, 0);
      g.addColorStop(0, 'rgba(91,227,255,0)');
      g.addColorStop(1, 'rgba(91,227,255,' + (i === 2 ? .55 : .3) + ')');
      c.save();
      slantPanel(c, edge - 140, 140, S, 'rgba(0,0,0,0)');
      c.restore();
      c.save();
      c.beginPath();
      c.moveTo(edge, 0); c.lineTo(edge + 6, 0); c.lineTo(edge + 6 - S, H); c.lineTo(edge - S, H);
      c.closePath();
      c.fillStyle = g; c.fill();
      c.restore();
    });

    var a = brandAlpha(p);
    if (a > 0) {
      c.save();
      c.globalAlpha = a;
      // cadre + marque
      c.strokeStyle = 'rgba(91,227,255,.5)';
      c.lineWidth = 2;
      var bw = 820, bh = 240;
      c.strokeRect(W / 2 - bw / 2, H / 2 - bh / 2, bw, bh);
      c.fillStyle = P.accent;
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (cn) {
        var x = W / 2 - bw / 2 + cn[0] * bw - 6, y = H / 2 - bh / 2 + cn[1] * bh - 6;
        c.fillRect(x, y, 12, 12);
      });
      var slide = (1 - a) * 22;
      centerText(c, CFG.brand || 'AUTOLT', P.font, P.ink, H / 2 - 12 + slide, 6);
      centerText(c, (CFG.handle || ''), P.mono, 'rgba(238,244,255,.6)', H / 2 + 56 + slide, 8);
      c.restore();
    }
  }

  /* ---------- DA 2 : SIGNATURE -------------------------------------------- */
  var CROWN = new Path2D('M2 12.5 12.5 24 26.5 2.5a6 6 0 0 1 11 0L51.5 24 62 12.5l-4 27.5H6L2 12.5Z');

  /* Panneau au bord avant irrégulier (façon coup de pinceau), en biais */
  function rough(i, seed) {
    return Math.sin(i * .9 + seed) * 9 + Math.sin(i * 2.3 + seed * 1.7) * 5.5 + Math.sin(i * 5.7 + seed) * 2.5;
  }
  function brushPanel(c, edgeX, back, S, seed) {
    var n = 44;
    c.beginPath();
    for (var i = 0; i <= n; i++) {
      var y = H * i / n;
      var x = edgeX + rough(i, seed) - S * (y / H);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.lineTo(back - S, H);
    c.lineTo(back, 0);
    c.closePath();
  }

  function drawSignature(c, p) {
    var P = PALETTE.signature, S = 300, w = W + S + 160;
    var delays = [0, .11, .2];

    P.layers.forEach(function (col, i) {
      var s = sweep(p, delays[i]);
      var x = s.phase === 'in' ? -w + s.k * w : s.k * w;
      var edge = s.phase === 'in' ? x + w : x;
      var back = s.phase === 'in' ? edge - w : edge + w;
      brushPanel(c, edge, back, S, i * 2.3 + 1);
      c.fillStyle = col; c.fill();

      /* éclats projetés devant l'arête */
      c.save();
      c.fillStyle = col;
      for (var k = 0; k < 9; k++) {
        var yy = ((k * 151 + i * 90) % 12) / 12 * H;
        var off = 26 + ((k * 73 + i * 31) % 210);
        var len = 50 + ((k * 57 + i * 19) % 190);
        var hgt = 5 + ((k * 13) % 16);
        var dirs = s.phase === 'in' ? 1 : -1;
        var ex = edge - S * (yy / H) + dirs * off;
        c.globalAlpha = .28 + ((k * 37) % 50) / 100;
        c.save(); c.translate(ex, yy); c.rotate(Math.PI / 2 - .28);
        c.fillRect(-hgt / 2, 0, hgt, len);
        c.restore();
      }
      c.restore();
    });

    var a = brandAlpha(p);
    if (a > 0) {
      c.save();
      c.globalAlpha = a;
      var lift = (1 - a) * 26;
      /* couronne */
      c.save();
      c.translate(W / 2 - 46, H / 2 - 168 + lift);
      c.scale(1.45, 1.45);
      c.fillStyle = P.accent;
      c.shadowColor = 'rgba(97,166,255,.8)'; c.shadowBlur = 26;
      c.fill(CROWN);
      c.restore();
      /* logotype */
      var g = c.createLinearGradient(W / 2 - 340, 0, W / 2 + 340, 0);
      g.addColorStop(0, '#ffffff'); g.addColorStop(.34, '#dbe8ff');
      g.addColorStop(.62, '#4b8dff'); g.addColorStop(1, '#1246c8');
      c.save();
      c.shadowColor = 'rgba(31,107,255,.55)'; c.shadowBlur = 50;
      centerText(c, CFG.brand || 'Autolt', P.font, g, H / 2 + lift, 0);
      c.restore();
      /* accroche */
      centerText(c, (CFG.tagline || '').replace(/\/\//g, '//'), P.mono,
        'rgba(244,248,255,.72)', H / 2 + 108 + lift, 8);
      c.restore();
    }
  }

  /* ---------- DA 3 : MONO -------------------------------------------------- */
  function drawMono(c, p) {
    var P = PALETTE.mono, N = 8, cw = W / N;

    for (var i = 0; i < N; i++) {
      var d = i * .055;
      var s = sweep(p, d);
      var y = s.phase === 'in' ? -H + s.k * H : s.k * H;
      c.fillStyle = '#0a0a0a';
      c.fillRect(i * cw, y, cw + 1, H);
      c.fillStyle = 'rgba(250,250,250,.85)';
      if (s.phase === 'in') c.fillRect(i * cw, y + H - 5, cw + 1, 5);
      else c.fillRect(i * cw, y, cw + 1, 5);
    }

    // flash blanc au point de bascule
    var fl = 1 - clamp(Math.abs(p - COVER) / .035, 0, 1);
    if (fl > 0) { c.fillStyle = 'rgba(250,250,250,' + (fl * .9) + ')'; c.fillRect(0, 0, W, H); }

    var a = brandAlpha(p);
    if (a > 0) {
      c.save();
      c.globalAlpha = a;
      c.fillStyle = P.ink;
      c.fillRect(W / 2 - 520, H / 2 - 3, 1040, 2);
      centerText(c, CFG.brand || 'AUTOLT', P.font, P.ink, H / 2 - 62, 2);
      centerText(c, (CFG.handle || '').toUpperCase(), P.mono, 'rgba(250,250,250,.7)', H / 2 + 52, 14);
      c.restore();
    }
  }

  var DRAW = { cobalt: drawCobalt, signature: drawSignature, mono: drawMono };

  /* ---------- Boucle ------------------------------------------------------- */
  function init() {
    var cv = document.getElementById('cv');
    cv.width = W; cv.height = H;
    var c = cv.getContext('2d');
    var draw = DRAW[da] || drawCobalt;

    function paint(p) {
      c.clearRect(0, 0, W, H);
      draw(c, clamp(p, 0, 1));
    }

    var fixed = Q.get('p');
    if (fixed !== null) {          // mode rendu : une image, puis on signale
      paint(parseFloat(fixed));
      document.body.setAttribute('data-ready', '1');
      return;
    }

    var t0 = performance.now(), gap = 700;
    (function loop(now) {
      var e = (now - t0) % (DUR + gap);
      paint(e > DUR ? 0 : e / DUR);
      requestAnimationFrame(loop);
    })(t0);
  }

  function fit() {
    var s = Math.min(innerWidth / W, innerHeight / H);
    document.documentElement.style.setProperty('--fit', Q.get('fit') === '0' ? 1 : s);
  }
  addEventListener('resize', fit);
  fit();

  /* Les polices doivent être explicitement chargées : le canvas ne déclenche
     pas le chargement d'une @font-face non utilisée dans le DOM. */
  var NEEDED = ['400 150px "Kaushan Script"', '700 76px "Chakra Petch"',
                '900 86px "Archivo"', '600 20px "JetBrains Mono"', '600 20px "Inter"'];
  if (document.fonts && document.fonts.load) {
    Promise.all(NEEDED.map(function (f) { return document.fonts.load(f).catch(function () {}); }))
      .then(function () { return document.fonts.ready; })
      .then(init);
  } else {
    addEventListener('load', init);
  }
})(window);
