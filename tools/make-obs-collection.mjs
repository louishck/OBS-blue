/* =========================================================================
   Génère une collection de scènes OBS où CHAQUE ÉLÉMENT est une source
   indépendante, déplaçable et redimensionnable comme on veut.

   Usage : node tools/make-obs-collection.mjs [--win] [--root <dossier>]
   Sortie : dist/obs/autolt-signature.json
   → OBS : Collection de scènes ▸ Importer.

   Les chemins enregistrés par OBS sont absolus : --win --root fabrique une
   collection pour un poste Windows depuis n'importe quel système.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i === -1 ? d : args[i + 1]; };

const DA = flag('da', 'signature');
const WIN = args.includes('--win');
const P = WIN ? path.win32 : path;
const ROOT = WIN ? flag('root', 'C:\\Users\\Public\\autolt-obs').replace(/[\\/]+$/, '')
                 : path.resolve(flag('root', REPO));
const OUT = path.join(REPO, 'dist', 'obs');
const uuid = () => crypto.randomUUID();
const DA_Q = DA === 'signature' ? null : `da=${DA}`;   // signature = valeur par défaut

/* -------------------------------------------------------------------------
   Les widgets. `w`/`h` sont les dimensions mesurées du rendu : ce sont
   celles à saisir dans OBS, et celles qu'on écrit dans la collection.
   ------------------------------------------------------------------------- */
const WIDGETS = {
  fond:       { file: 'bg.html',      w: 1920, h: 1080, label: 'Fond' },
  logo:       { file: 'logo.html',    w: 538,  h: 332,  label: 'Logotype' },
  logoPetit:  { file: 'logo-petit.html', w: 274, h: 193, label: 'Logotype petit' },
  accroche:   { file: 'tagline.html', w: 648,  h: 74,   label: 'Accroche' },
  reseaux:    { file: 'socials.html', w: 655,  h: 90,   label: 'Réseaux' },
  panneaux:   { file: 'panels.html',  w: 568,  h: 440,  label: 'Panneau réseaux' },
  camera:     { file: 'cam.html',     w: 448,  h: 273,  label: 'Cadre caméra' },
  chat:       { file: 'chat.html',    w: 408,  h: 608,  label: 'Cadre chat' },
  chatHaut:   { file: 'chat-haut.html', w: 408, h: 858, label: 'Cadre chat haut' },
  cadreJeu:   { file: 'jeu.html',     w: 1488, h: 858,  label: 'Cadre jeu' },
  live:       { file: 'live.html',    w: 231,  h: 100,  label: 'Pastille live' },
  faceit:     { file: 'faceit.html',  w: 783,  h: 100,  label: 'Stats FACEIT' },
  minuterie:  { file: 'timer.html',   w: 283,  h: 110,  label: 'Minuterie' },
  alertes:    { file: 'alertes.html', w: 516,  h: 346,  label: 'Barres d’alerte' },
  pStarting:  { file: 'phrase-starting.html', w: 752, h: 84, label: 'Phrase / starting' },
  pPause:     { file: 'phrase-pause.html',    w: 693, h: 84, label: 'Phrase / pause' },
  pFin:       { file: 'phrase-fin.html',      w: 586, h: 84, label: 'Phrase / fin' },
  pOffline:   { file: 'phrase-offline.html',  w: 585, h: 84, label: 'Phrase / offline' }
};

/* Centre horizontalement un widget sur le canevas 1920 */
const cx = (k) => Math.round((1920 - WIDGETS[k].w) / 2);
/* Le contenu d'un widget est décalé de 24 px (marge anti-rognage) : on
   positionne la source pour que le contenu tombe où on le veut.            */
const PAD = 24;

/* -------------------------------------------------------------------------
   Les scènes. Chaque entrée est une source posée à un endroit — l'utilisateur
   peut ensuite tout déplacer à la souris sans que rien d'autre ne bouge.
   Premier de la liste = dessous, dernier = dessus.
   ------------------------------------------------------------------------- */
const SCENES = [
  { name: '🎮 Jeu', items: [
      { k: 'logoPetit', x: 262,        y: -32 },
      { k: 'live',      x: 500,        y: 0 },
      { k: 'faceit',    x: 1113,       y: 0 },
      { k: 'chat',      x: 1506,       y: 446 },
      { k: 'camera',    x: 1472,       y: 760, visible: false },
      { k: 'alertes',   x: 60,         y: 360, visible: false }
  ] },
  { name: '🖼 Jeu encadré', items: [
      { k: 'fond',      x: 0,          y: 0 },
      { k: 'cadreJeu',  x: 16,         y: 116 },
      { k: 'chatHaut',  x: 1496,       y: 116 },
      { k: 'logoPetit', x: -8,         y: -40 },
      { k: 'accroche',  x: 236,        y: 22 },
      { k: 'faceit',    x: 1113,       y: 0 },
      { k: 'reseaux',   x: cx('reseaux'), y: 966 }
  ] },
  { name: '⏳ Starting', items: [
      { k: 'fond',      x: 0,             y: 0 },
      { k: 'logo',      x: cx('logo'),    y: 237 },
      { k: 'pStarting', x: cx('pStarting'), y: 581 },
      { k: 'minuterie', x: cx('minuterie'), y: 705 }
  ] },
  { name: '⏸ Pause', items: [
      { k: 'fond',      x: 0,             y: 0 },
      { k: 'logo',      x: cx('logo'),    y: 245 },
      { k: 'pPause',    x: cx('pPause'),  y: 591 },
      { k: 'reseaux',   x: cx('reseaux'), y: 717 }
  ] },
  { name: '👋 Fin', items: [
      { k: 'fond',      x: 0,             y: 0 },
      { k: 'logo',      x: cx('logo'),    y: 245 },
      { k: 'pFin',      x: cx('pFin'),    y: 591 },
      { k: 'reseaux',   x: cx('reseaux'), y: 717 }
  ] },
  { name: '📴 Offline', items: [
      { k: 'fond',      x: 0,             y: 0 },
      { k: 'logo',      x: cx('logo'),    y: 245 },
      { k: 'pOffline',  x: cx('pOffline'), y: 591 },
      { k: 'reseaux',   x: cx('reseaux'), y: 717 }
  ] },
  { name: '🔗 Réseaux', items: [
      { k: 'fond',      x: 0,             y: 0 },
      { k: 'logo',      x: cx('logo'),    y: 131 },
      { k: 'panneaux',  x: cx('panneaux'), y: 481 }
  ] }
];

/* -------------------------------------------------------------------------
   Fabrication
   ------------------------------------------------------------------------- */
function fileUrl(abs) {
  return WIN ? 'file:///' + abs.replace(/\\/g, '/') : pathToFileURL(abs).href;
}
/* OBS ignore le champ url quand « Fichier local » est coché : on n'y passe
   que si le widget a besoin d'options.                                      */
function browserSettings(w) {
  const abs = P.join(ROOT, 'overlays', 'widgets', w.file);
  const qs = (w.q || []).concat(DA_Q ? [DA_Q] : []);
  const base = { width: w.w, height: w.h, fps_custom: false, fps: 30,
    reroute_audio: false, restart_when_active: true, shutdown: true,
    webpage_control_level: 1, css: '' };
  return qs.length
    ? { is_local_file: false, local_file: abs, url: fileUrl(abs) + '?' + qs.join('&'), ...base }
    : { is_local_file: true, local_file: abs, url: '', ...base };
}

const ids = new Map();
const sources = [];
const used = new Set(SCENES.flatMap((s) => s.items.map((i) => i.k)));

for (const key of Object.keys(WIDGETS)) {
  if (!used.has(key)) continue;
  const w = WIDGETS[key];
  const id = uuid(); ids.set(key, id);
  sources.push({
    prev_ver: 520093699, name: `Autolt · ${w.label}`, uuid: id,
    id: 'browser_source', versioned_id: 'browser_source',
    settings: browserSettings(w),
    mixers: 0, sync: 0, flags: 0, volume: 1.0, balance: 0.5,
    enabled: true, muted: false, 'push-to-mute': false, 'push-to-mute-delay': 0,
    'push-to-talk': false, 'push-to-talk-delay': 0, hotkeys: {},
    deinterlace_mode: 0, deinterlace_field_order: 0, monitoring_type: 0,
    private_settings: {}
  });
}

function sceneItem(it, id) {
  const w = WIDGETS[it.k];
  return {
    name: `Autolt · ${w.label}`, source_uuid: ids.get(it.k),
    visible: it.visible !== false, locked: false,
    rot: 0.0, pos: { x: it.x, y: it.y }, scale: { x: 1.0, y: 1.0 },
    align: 5, bounds_type: 0, bounds_align: 0, bounds: { x: 0.0, y: 0.0 },
    crop_left: 0, crop_top: 0, crop_right: 0, crop_bottom: 0,
    id, group_item_backup: false,
    scale_filter: 'disable', blend_method: 'default', blend_type: 'normal',
    show_transition: { duration: 0 }, hide_transition: { duration: 0 },
    private_settings: {}
  };
}

for (const sc of SCENES) {
  const id = uuid(); ids.set(sc.name, id);
  let n = sc.items.length;
  sources.push({
    prev_ver: 520093699, name: sc.name, uuid: id,
    id: 'scene', versioned_id: 'scene',
    settings: {
      id_counter: n, custom_size: false,
      items: sc.items.slice().reverse().map((it) => sceneItem(it, n--))
    },
    mixers: 0, sync: 0, flags: 0, volume: 1.0, balance: 0.5,
    enabled: true, muted: false, 'push-to-mute': false, 'push-to-mute-delay': 0,
    'push-to-talk': false, 'push-to-talk-delay': 0, hotkeys: {},
    deinterlace_mode: 0, deinterlace_field_order: 0, monitoring_type: 0,
    private_settings: {}
  });
}

const collection = {
  current_scene: SCENES[0].name,
  current_program_scene: SCENES[0].name,
  current_transition: 'Stinger Autolt',
  groups: [], modules: {},
  name: `Autolt — ${DA}`,
  preview_locked: false,
  quick_transitions: [
    { name: 'Fondu', duration: 300, hotkeys: [], id: 1, fade_to_black: false },
    { name: 'Stinger Autolt', duration: 300, hotkeys: [], id: 2, fade_to_black: false }
  ],
  saved_projectors: [],
  scaling_enabled: false, scaling_level: 0, scaling_off_x: 0.0, scaling_off_y: 0.0,
  scene_order: SCENES.map((s) => ({ name: s.name })),
  sources,
  transition_duration: 300,
  transitions: [{
    name: 'Stinger Autolt', id: 'obs_stinger_transition',
    settings: {
      path: P.join(ROOT, 'dist', 'stingers', `stinger-${DA}.webm`),
      transition_point: 550, tp_type: 0,
      audio_monitoring: 0, audio_fade_style: 0,
      track_matte_enabled: false, invert_matte: false
    }
  }],
  version: 2
};

fs.mkdirSync(OUT, { recursive: true });
const out = path.join(OUT, `autolt-${DA}.json`);
fs.writeFileSync(out, JSON.stringify(collection, null, 2));
console.log('✓', path.relative(REPO, out));
console.log('  ' + SCENES.length + ' scènes, ' + used.size + ' éléments indépendants');
console.log('  Widgets pointés sur : ' + P.join(ROOT, 'overlays', 'widgets'));
