# Les éléments indépendants (widgets)

Chaque élément de l'habillage est une page à part, avec un fond transparent.
Dans OBS, ça donne **une source par élément** : tu déplaces, redimensionnes,
masques ou dupliques chacun sans toucher aux autres.

Ils sont tous dans `overlays/widgets/`.

| Élément | Fichier | Taille de la source |
|---|---|---|
| Fond (dégradé + coups de pinceau) | `bg.html` | 1920 × 1080 |
| Logotype + couronne | `logo.html` | 538 × 332 |
| Logotype petit | `logo-petit.html` | 274 × 193 |
| Accroche (STREAM // GAMING // …) | `tagline.html` | 648 × 74 |
| Rangée de réseaux | `socials.html` | 655 × 90 |
| Panneau profil / réseaux | `panels.html` | 568 × 440 |
| Cadre caméra | `cam.html` | 448 × 273 |
| Cadre chat | `chat.html` | 408 × 608 |
| Cadre chat haut | `chat-haut.html` | 408 × 858 |
| Cadre jeu | `jeu.html` | 1488 × 858 |
| Pastille « en direct » | `live.html` | 231 × 100 |
| Stats FACEIT (elo, winrate, %HS, K/D) | `faceit.html` | 783 × 100 |
| Infos partie (map + elo, fixes) | `infos.html` | 511 × 100 |
| Minuterie | `timer.html` | 283 × 110 |
| Barres d'alerte | `alertes.html` | 516 × 346 |
| Phrase « le stream commence bientôt » | `phrase-starting.html` | 752 × 84 |
| Phrase « pause » | `phrase-pause.html` | 693 × 84 |
| Phrase « merci d'avoir regardé » | `phrase-fin.html` | 586 × 84 |
| Phrase « actuellement offline » | `phrase-offline.html` | 585 × 84 |

## La marge de 24 px

Chaque widget garde **24 px de marge** autour de son contenu (52 px pour le
logotype) : sans ça, OBS rognerait les coins renforcés des cadres, les
étiquettes qui débordent et les halos bleus.

Conséquence pratique pour les cadres : **ce qui va dessous se place 24 px en
dedans**. Un cadre caméra posé en `x 1490 / y 760` accueille une caméra de
`400 × 225` posée en `x 1514 / y 784`.

## Les options

Les variantes utiles ont **leur propre fichier** (`logo-petit.html`,
`chat-haut.html`, `phrase-pause.html`…) : la collection n'utilise donc que des
fichiers locaux, qu'OBS sait retrouver tout seul si le dossier bouge.

Pour le reste, les options s'ajoutent à l'URL. Attention : le champ « Fichier
local » d'OBS ne les lit pas — pour les utiliser, **décoche « Fichier local »**
et colle l'adresse complète dans **URL** :

```
file:///C:/Users/Public/autolt-obs/overlays/widgets/cam.html?w=520&h=293
```

| Option | Widgets concernés | Effet |
|---|---|---|
| `?w=` `?h=` | cam, chat, jeu | taille intérieure du cadre |
| `?tab=` | cam, chat, jeu | texte de l'étiquette accrochée au cadre |
| `?size=sm\|md\|xl` | logo | taille du logotype |
| `?scene=` | phrase | `starting`, `pause`, `ending`, `offline` |
| `?text=` | phrase, tagline | ton propre texte (`/` = séparateur bleu, `*mot*` = mot en bleu) |
| `?map=` `?elo=` | infos | valeurs affichées |
| `?t=` | timer | durée en secondes |
| `?label=` | live | texte de la pastille |
| `?demo=1` | chat, faceit | affiche des valeurs d'exemple, pratique pour régler la position |
| `?dir=col` | faceit | les quatre stats empilées au lieu d'une rangée |

Le reste (pseudo, réseaux, phrases par défaut, couleurs) se règle une fois pour
toutes dans `overlays/js/config.js`.

## Composer une scène

Le principe est toujours le même : le **fond** tout en bas de la pile, puis tes
sources à toi (capture de jeu, caméra, widget de chat), puis les cadres et les
éléments d'habillage par-dessus.

La collection livrée dans `dist/obs/` est déjà montée comme ça — tu peux t'en
servir comme point de départ et tout déplacer à la souris.


## Les stats FACEIT

`faceit.html` affiche **ELO, winrate, % HS et K/D**, lus sur ton profil FACEIT
et rafraîchis toutes les 5 minutes (réglable). Le pseudo se met dans
`overlays/js/config.js` :

```js
faceit: {
  nickname: 'autolt_',     // le pseudo dans l'URL de ton profil
  game: 'cs2',
  apiKey: '',              // facultatif, voir plus bas
  proxy: '',               // dépannage CORS, voir plus bas
  refreshSeconds: 300
}
```

### Si les chiffres ne s'affichent pas

Ouvre **`overlays/widgets/faceit-test.html`** : la page dit quelles requêtes
sont parties, ce qu'elles ont répondu, les valeurs reconnues, et le remède.

Deux causes possibles :

1. **Le navigateur bloque la requête** (message « Failed to fetch »). Une page
   ouverte en `file://` n'a pas le droit d'appeler n'importe quel site. Remède :
   ```js
   proxy: 'https://api.allorigins.win/raw?url='
   ```
   dans `config.js`. Les requêtes passent alors par un relais public.

2. **FACEIT a renommé ses champs.** La page de diagnostic affiche la réponse
   brute : les valeurs sont cherchées par motif (`elo`, `win rate`, `headshot`,
   `k/d`) partout dans le JSON, donc un renommage mineur ne casse rien — mais
   un gros changement demande une mise à jour.

### Avec une clé API officielle (plus stable)

Crée une clé gratuite sur <https://developers.faceit.com> (application ▸ API
key ▸ *server side*), colle-la dans `apiKey`. Le widget passe alors par l'API
officielle `open.faceit.com` au lieu des points d'entrée publics du site.
La clé reste **en clair dans `config.js`** : ne publie pas ce fichier ailleurs
que dans ton dépôt privé, et révoque-la si tu la diffuses par erreur.

### Pendant que rien n'a encore été lu

Les dernières valeurs connues sont gardées dans le navigateur : si le réseau
tombe en plein live, l'overlay continue d'afficher les derniers chiffres au
lieu de se vider. Avant le tout premier chargement réussi, ce sont les tirets
de `fallback` qui s'affichent.
