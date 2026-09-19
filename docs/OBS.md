# Installer le pack dans OBS

Deux méthodes : l'import automatique (rapide) ou la configuration manuelle
(recommandée si tu as déjà des scènes à garder).

---

## Méthode 1 — Importer la collection toute faite

```bash
node tools/make-obs-collection.mjs --da signature      # ou cobalt / mono
```

Puis dans OBS : **Collection de scènes ▸ Importer** → choisis
`dist/obs/autolt-signature.json` → **Passer à cette collection**.

Tu obtiens 8 scènes (Jeu, Starting, Pause, Webcam, Chat, Fin, Offline, Réseaux),
les sources navigateur déjà réglées en 1920 × 1080, et le stinger déjà branché.

> Les chemins enregistrés sont **absolus**. Si tu déplaces le dossier, relance la
> commande avec `--root /nouveau/chemin` et réimporte.

Il te reste à ajouter **tes** sources à toi : capture de jeu, caméra, micro,
widget de chat — voir les tailles exactes plus bas.

---

## Méthode 2 — À la main

### Ajouter une scène

1. **Sources ▸ + ▸ Source navigateur ▸ Créer**
2. Coche **Fichier local**, puis choisis la page voulue dans `overlays/`
3. **Largeur 1920**, **Hauteur 1080**
4. Coche **Fermer la source quand elle n'est pas visible** et
   **Rafraîchir le navigateur quand la scène devient active**
   (indispensable pour que les minuteries et les animations repartent à zéro)
5. Position **x 0 / y 0**

| Scène                | Fichier          | Transparent | À poser…                    |
|----------------------|------------------|-------------|-----------------------------|
| Jeu (plein écran)    | `live.html`      | oui         | **au-dessus** du jeu        |
| Jeu (encadré)        | `live.html?layout=frame` | non | au-dessus du jeu           |
| Starting             | `starting.html`  | non         | seule                       |
| Pause                | `pause.html`     | non         | seule                       |
| Webcam               | `webcam.html`    | oui         | au-dessus de la caméra      |
| Fin                  | `ending.html`    | non         | seule                       |
| Alertes              | `alerts.html`    | oui         | au-dessus de tout           |
| Chat                 | `chat.html`      | oui         | au-dessus du widget de chat |
| Offline              | `offline.html`   | non         | seule                       |
| Réseaux              | `panels.html`    | non         | seule                       |

### Tailles et positions à reproduire

**Scène de jeu, variante encadrée** (`live.html?layout=frame`) :

| Source           | Taille       | Position        |
|------------------|--------------|-----------------|
| Capture du jeu   | 1440 × 810   | x **40** / y **140** |
| Widget de chat   | 360 × 768    | x **1520** / y **140** |

**Scène de jeu, variante plein écran** (`live.html`) : le jeu occupe
1920 × 1080, l'overlay se pose dessus. Le chat va dans le cadre de droite :
**360 × 460**, x **1530** / y **470**.

> Tu préfères la caméra dans ce cadre ? Ajoute `?rail=cam` : la caméra revient
> (360 × 203 en x 1520 / y 140 en encadré, 400 × 225 en bas à droite en plein
> écran) et, en encadré, le chat reprend sa place dessous en 360 × 544
> (x 1520 / y 406).
Ajoute `?guides=1` à l'URL pour afficher en rouge les zones occupées par le HUD
de CS2 (radar, score, killfeed, vie, équipement, munitions) et vérifier que
rien ne se chevauche — pense à retirer le paramètre ensuite.

**Webcam** : `webcam.html?w=1280&h=720` dessine un cadre de 1280 × 720 centré ;
place ta source vidéo exactement dessous (x **320** / y **180**).

---

## Le stinger (transition)

1. **Transitions de scène ▸ + ▸ Stinger**
2. **Fichier vidéo** → `dist/stingers/stinger-signature.webm`
   (ou `stinger-cobalt.webm` / `stinger-mono.webm`)
3. **Point de transition** : `550` ms (type « Temps »)
4. Laisse **Suivi de transparence** décoché : la vidéo a déjà son canal alpha.

Le stinger dure 1,1 s et couvre l'écran à mi-parcours, d'où les 550 ms.

Pour régénérer les fichiers (après avoir changé le pseudo, par exemple) :

```bash
npm install          # une seule fois
node tools/render-stinger.mjs              # les trois DA
node tools/render-stinger.mjs signature    # une seule
```

---

## Réglages utiles

- **Minuterie de l'écran de lancement** : `starting.html?t=900` (900 s = 15 min).
- **Changer de DA sans rien réinstaller** : `?da=signature`, `?da=cobalt`, `?da=mono`.
- **Machine modeste** : ajoute `?fx=low` → plus aucune animation canvas,
  la consommation CPU tombe à presque rien.
- **Position des alertes** : `alerts.html?pos=right` ou `?pos=top`.
- **Caméra plutôt que chat** sur la scène de jeu : `live.html?rail=cam`.
- Les polices sont **embarquées** dans le pack : aucune connexion internet
  n'est nécessaire, et le rendu est identique sur n'importe quelle machine.
