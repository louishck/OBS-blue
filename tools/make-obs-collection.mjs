/* =========================================================================
   Génère une collection de scènes OBS prête à importer.
   Usage : node tools/make-obs-collection.mjs [--da signature] [--layout fullscreen]
   Sortie : dist/obs/autolt-<da>.json
   → OBS : Scene Collection ▸ Import ▸ choisir le fichier.
   Les chemins des sources sont absolus : régénère le fichier si tu déplaces
   le dossier (ou passe --root /nouveau/chemin).
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
const LAYOUT = flag('layout', 'fullscreen');
const NAME = flag('name', null);
/* --win : fabrique des chemins Windows (C:\…\overlays\live.html) même quand
   le script tourne ailleurs. Sert à livrer des collections prêtes à importer
   pour un emplacement convenu.                                              */
const WIN = args.includes('--win');
const P = WIN ? path.win32 : path;
const ROOT = WIN ? flag('root', 'C:\\Users\\Public\\autolt-obs').replace(/[\\/]+$/, '')
                 : path.resolve(flag('root', REPO));
const OUT = path.join(REPO, 'dist', 'obs');
const uuid = () => crypto.randomUUID();

/* OBS ignore la chaîne de requête quand « Fichier local » est coché : on ne
   passe en mode URL (file://…?…) que si la scène a vraiment besoin d'options.
   Sinon on reste en fichier local, plus robuste — et réparable depuis la
   fenêtre « Fichiers manquants » d'OBS si le dossier bouge.                 */
function fileUrl(abs) {
  return WIN ? 'file:///' + abs.replace(/\\/g, '/') : pathToFileURL(abs).href;
}
function browserSettings(file, params) {
  const abs = P.join(ROOT, 'overlays', file);
  const qs = (params || []).filter(Boolean);
  if (!qs.length) return { is_local_file: true, local_file: abs, url: '' };
  return { is_local_file: false, local_file: abs, url: fileUrl(abs) + '?' + qs.join('&') };
}

/* --- sources navigateur ---------------------------------------------- */
const DA_PARAM = DA === 'signature' ? '' : `da=${DA}`;          // signature = défaut
const LAYOUT_PARAM = LAYOUT === 'fullscreen' ? '' : `layout=${LAYOUT}`;
const BROWSERS = [
  ['Autolt / Jeu',       'live.html',     [DA_PARAM, LAYOUT_PARAM]],
  ['Autolt / Pause',     'pause.html',    [DA_PARAM]],
  ['Autolt / Starting',  'starting.html', [DA_PARAM]],
  ['Autolt / Webcam',    'webcam.html',   [DA_PARAM]],
  ['Autolt / Fin',       'ending.html',   [DA_PARAM]],
  ['Autolt / Alertes',   'alerts.html',   [DA_PARAM]],
  ['Autolt / Chat',      'chat.html',     [DA_PARAM]],
  ['Autolt / Offline',   'offline.html',  [DA_PARAM]],
  ['Autolt / Réseaux',   'panels.html',   [DA_PARAM]]
];

/* --- scènes : nom → sources empilées (du fond vers le dessus) ---------- */
const SCENES = [
  ['🎮 Jeu',      ['Autolt / Jeu', 'Autolt / Alertes']],
  ['⏳ Starting', ['Autolt / Starting']],
  ['⏸ Pause',     ['Autolt / Pause']],
  ['🎙 Webcam',   ['Autolt / Webcam']],
  ['💬 Chat',     ['Autolt / Chat']],
  ['👋 Fin',      ['Autolt / Fin']],
  ['📴 Offline',  ['Autolt / Offline']],
  ['🔗 Réseaux',  ['Autolt / Réseaux']]
];

const ids = new Map();
const sources = [];

for (const [name, file, params] of BROWSERS) {
  const id = uuid(); ids.set(name, id);
  sources.push({
    prev_ver: 520093699, name, uuid: id,
    id: 'browser_source', versioned_id: 'browser_source',
    settings: {
      ...browserSettings(file, params),
      width: 1920, height: 1080,
      fps_custom: false, fps: 30,
      reroute_audio: false, restart_when_active: true, shutdown: true,
      webpage_control_level: 1, css: ''
    },
    mixers: 0, sync: 0, flags: 0, volume: 1.0, balance: 0.5,
    enabled: true, muted: false, 'push-to-mute': false, 'push-to-mute-delay': 0,
    'push-to-talk': false, 'push-to-talk-delay': 0, hotkeys: {},
    deinterlace_mode: 0, deinterlace_field_order: 0, monitoring_type: 0,
    private_settings: {}
  });
}

function item(name, id) {
  return {
    name, source_uuid: ids.get(name), visible: true, locked: false,
    rot: 0.0, pos: { x: 0.0, y: 0.0 }, scale: { x: 1.0, y: 1.0 },
    align: 5, bounds_type: 0, bounds_align: 0, bounds: { x: 0.0, y: 0.0 },
    crop_left: 0, crop_top: 0, crop_right: 0, crop_bottom: 0,
    id, group_item_backup: false,
    scale_filter: 'disable', blend_method: 'default', blend_type: 'normal',
    show_transition: { duration: 0 }, hide_transition: { duration: 0 },
    private_settings: {}
  };
}

for (const [name, layers] of SCENES) {
  const id = uuid(); ids.set(name, id);
  let n = layers.length;
  sources.push({
    prev_ver: 520093699, name, uuid: id,
    id: 'scene', versioned_id: 'scene',
    settings: {
      id_counter: n, custom_size: false,
      items: layers.slice().reverse().map((s) => item(s, n--))
    },
    mixers: 0, sync: 0, flags: 0, volume: 1.0, balance: 0.5,
    enabled: true, muted: false, 'push-to-mute': false, 'push-to-mute-delay': 0,
    'push-to-talk': false, 'push-to-talk-delay': 0, hotkeys: {},
    deinterlace_mode: 0, deinterlace_field_order: 0, monitoring_type: 0,
    private_settings: {}
  });
}

const stinger = P.join(ROOT, 'dist', 'stingers', `stinger-${DA}.webm`);
const collection = {
  DesktopAudioDevice1: { prev_ver: 520093699, name: 'Audio du bureau', id: 'pulse_output_capture', versioned_id: 'pulse_output_capture', settings: {}, mixers: 255, sync: 0, flags: 0, volume: 1.0, balance: 0.5, enabled: true, muted: false, 'push-to-mute': false, 'push-to-mute-delay': 0, 'push-to-talk': false, 'push-to-talk-delay': 0, hotkeys: {}, deinterlace_mode: 0, deinterlace_field_order: 0, monitoring_type: 0, private_settings: {} },
  current_scene: SCENES[0][0],
  current_program_scene: SCENES[0][0],
  current_transition: 'Stinger Autolt',
  groups: [],
  modules: {},
  name: NAME || `Autolt — ${DA}${LAYOUT === 'frame' ? ' (encadré)' : ''}`,
  preview_locked: false,
  quick_transitions: [
    { name: 'Fondu', duration: 300, hotkeys: [], id: 1, fade_to_black: false },
    { name: 'Stinger Autolt', duration: 300, hotkeys: [], id: 2, fade_to_black: false }
  ],
  saved_projectors: [],
  scaling_enabled: false, scaling_level: 0, scaling_off_x: 0.0, scaling_off_y: 0.0,
  scene_order: SCENES.map(([name]) => ({ name })),
  sources,
  transition_duration: 300,
  transitions: [{
    name: 'Stinger Autolt',
    id: 'obs_stinger_transition',
    settings: {
      path: stinger,
      transition_point: 550, tp_type: 0,
      audio_monitoring: 0, audio_fade_style: 0,
      track_matte_enabled: false, invert_matte: false
    }
  }],
  version: 2
};

fs.mkdirSync(OUT, { recursive: true });
const out = path.join(OUT, `autolt-${DA}${LAYOUT === 'frame' ? '-encadre' : ''}.json`);
fs.writeFileSync(out, JSON.stringify(collection, null, 2));
console.log('✓', path.relative(REPO, out));
console.log('  OBS ▸ Collection de scènes ▸ Importer ▸ ' + out);
console.log('  Sources pointées sur : ' + P.join(ROOT, 'overlays'));
