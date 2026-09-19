/* =========================================================================
   AUTOLT — Configuration globale des overlays
   Le seul fichier à éditer au quotidien. Tout le reste s'adapte.
   ========================================================================= */
window.BB_CONFIG = {
  /* --- Identité ------------------------------------------------------- */
  brand: 'Autolt',                       // logotype manuscrit
  brandShort: 'A',                       // monogramme (DA cobalt / mono)
  tagline: 'STREAM // GAMING // GOOD VIBES',
  handle: '@autolt',

  /* Direction artistique : 'signature' | 'cobalt' | 'mono'
     Surchargeable dans l'URL : starting.html?da=mono                      */
  da: 'signature',

  /* Qualité des effets : 'high' (canvas animé) | 'low' (CSS seul, ~0 CPU) */
  fx: 'high',

  /* --- Phrases de chaque scène ------------------------------------------
     « / » = séparateur bleu, *mot* = mot mis en avant en bleu.            */
  scenes: {
    starting: { line: 'LE STREAM COMMENCE *BIENTÔT*' },
    pause:    { line: '*PAUSE* / JE REVIENS BIENTÔT' },
    ending:   { line: 'MERCI D’AVOIR *REGARDÉ*' },
    offline:  { line: 'ACTUELLEMENT *OFFLINE*', sub: 'REJOINS-MOI SUR LES RÉSEAUX' },
    webcam:   { tab: 'AUTOLT' },
    chat:     { tab: 'CHAT' }
  },

  /* --- Minuterie (scène starting) --------------------------------------
     Secondes. Surchargeable dans l'URL : starting.html?t=900              */
  countdown: { starting: 600, pause: 300 },

  /* --- Réseaux affichés en bas des scènes ------------------------------- */
  socials: [
    { icon: 'youtube', label: '/Autolt' },
    { icon: 'twitch',  label: '/Autolt' },
    { icon: 'tiktok',  label: '/Autolt' },
    { icon: 'x',       label: '/Autolt' }
  ],

  /* --- Panneau profil / réseaux (scène panels) --------------------------- */
  panels: [
    { icon: 'twitch',  label: 'Twitch' },
    { icon: 'youtube', label: 'YouTube' },
    { icon: 'tiktok',  label: 'TikTok' },
    { icon: 'x',       label: 'X (Twitter)' },
    { icon: 'discord', label: 'Discord' }
  ],

  /* --- Barres d'alerte (scène alerts) ------------------------------------
     'who' : laisse vide pour un simple gabarit à superposer aux widgets
     de ton bot (Streamlabs / StreamElements), ou remplis pour une démo.    */
  alerts: [
    { icon: 'heart', label: 'Dernier follow', who: '' },
    { icon: 'star',  label: 'Dernier sub',    who: '' },
    { icon: 'euro',  label: 'Dernier don',    who: '' },
    { icon: 'gem',   label: 'Dernier cheer',  who: '' }
  ],

  /* --- Scène de jeu (live) ----------------------------------------------- */
  live: {
    game: 'Counter-Strike 2',
    mode: 'Premier',
    map: 'de_mirage',
    rank: '18 420 elo',
    /* 'fullscreen' = jeu en plein écran, overlay transparent dans les coins
       'frame'      = jeu encadré + rail droit (caméra, chat, réseaux)      */
    layout: 'fullscreen'
  },

  /* --- Bandeau défilant (optionnel, non utilisé par défaut) -------------- */
  ticker: [
    'Bienvenue sur le live d’Autolt',
    '!discord pour rejoindre la communauté',
    'Un follow, ça coûte rien et ça fait plaisir'
  ],

  /* --- Chat d'exemple (repère de placement du vrai widget) --------------- */
  chatSample: [
    { u: 'kev1n_',  m: 'ce spawn est illégal' },
    { u: 'nadia',   m: 'GG le clutch 1v3' },
    { u: 'p0tat0',  m: '!setup' },
    { u: 'thom4s',  m: 'la team est en forme ce soir' }
  ],

  showClock: true,
  locale: 'fr-FR'
};
