# Les éléments indépendants (widgets)

Chaque élément de l'habillage est une page à part, avec un fond transparent.
Dans OBS, ça donne **une source par élément** : tu déplaces, redimensionnes,
masques ou dupliques chacun sans toucher aux autres.

Ils sont tous dans `overlays/widgets/`.

| Élément | Fichier | Taille de la source |
|---|---|---|
| Fond (dégradé + coups de pinceau) | `bg.html` | 1920 × 1080 |
| Logotype + couronne | `logo.html` | 538 × 332 |
| Logotype petit | `logo.html?size=sm` | 274 × 193 |
| Accroche (STREAM // GAMING // …) | `tagline.html` | 648 × 74 |
| Rangée de réseaux | `socials.html` | 655 × 90 |
| Panneau profil / réseaux | `panels.html` | 568 × 440 |
| Cadre caméra | `cam.html` | 448 × 273 |
| Cadre chat | `chat.html` | 408 × 608 |
| Cadre jeu | `jeu.html` | 1488 × 858 |
| Pastille « en direct » | `live.html` | 231 × 100 |
| Infos partie (map + elo) | `infos.html` | 511 × 100 |
| Minuterie | `timer.html` | 283 × 110 |
| Barres d'alerte | `alertes.html` | 516 × 346 |
| Phrase de scène | `phrase.html?scene=pause` | ~700 × 84 |

## La marge de 24 px

Chaque widget garde **24 px de marge** autour de son contenu (52 px pour le
logotype) : sans ça, OBS rognerait les coins renforcés des cadres, les
étiquettes qui débordent et les halos bleus.

Conséquence pratique pour les cadres : **ce qui va dessous se place 24 px en
dedans**. Un cadre caméra posé en `x 1490 / y 760` accueille une caméra de
`400 × 225` posée en `x 1514 / y 784`.

## Les options

Elles s'ajoutent à l'URL. Attention : le champ « Fichier local » d'OBS ne les
accepte pas — pour les utiliser, **décoche « Fichier local »** et colle
l'adresse complète dans **URL** :

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
| `?demo=1` | chat | affiche de faux messages, pratique pour régler la position |

Le reste (pseudo, réseaux, phrases par défaut, couleurs) se règle une fois pour
toutes dans `overlays/js/config.js`.

## Composer une scène

Le principe est toujours le même : le **fond** tout en bas de la pile, puis tes
sources à toi (capture de jeu, caméra, widget de chat), puis les cadres et les
éléments d'habillage par-dessus.

La collection livrée dans `dist/obs/` est déjà montée comme ça — tu peux t'en
servir comme point de départ et tout déplacer à la souris.
