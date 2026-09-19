# Les trois directions artistiques

Les trois DA partagent **exactement les mêmes scènes et les mêmes composants** :
tu peux changer d'avis à tout moment en remplaçant `?da=…` dans les URL, sans
retoucher OBS.

---

## 1. Signature — *celle de la référence* (par défaut)

**Le principe.** Logotype manuscrit au pinceau surmonté d'une couronne, nuit
bleue, coups de pinceau électriques projetés dans les angles, cadres néon à
coins renforcés avec étiquette accrochée.

- **Couleurs** : noir bleuté `#04060E` → `#0D1B38`, bleu `#1F6BFF`, bleu clair `#61A6FF`
- **Typos** : *Kaushan Script* (logotype), *Archivo* (titres), *Inter* (textes), *JetBrains Mono* (chiffres)
- **Signes** : couronne, biseaux à 26°, halos bleus, éclats de peinture
- **Pour qui** : une chaîne gaming qui veut une identité chaleureuse et reconnaissable au premier coup d'œil.

## 2. Cobalt — HUD e-sport

**Le principe.** Interface de jeu compétitif : panneaux biseautés, grille en
perspective, particules, lignes de scan, tout en bleu électrique sur noir profond.

- **Couleurs** : `#04060D` → `#0E2350`, bleu `#2F7BFF`, cyan `#5BE3FF`
- **Typos** : *Chakra Petch* (titres), *Inter*, *JetBrains Mono*
- **Signes** : crochets d'angle, coins coupés, halos cyan, scanlines
- **Pour qui** : les streams très orientés compétition / classement.

## 3. Mono — noir & blanc brutaliste

**Le principe.** Zéro couleur. Typographie énorme, filets épais, bandeaux
inversés, grain de pellicule, anneau gradué qui tourne lentement.

- **Couleurs** : `#0A0A0A` et `#FAFAFA`, rien d'autre
- **Typos** : *Archivo Black*, *Inter*, *JetBrains Mono*
- **Signes** : blocs pleins inversés, filets de 2 px, grain animé
- **Pour qui** : une image de marque sobre, éditoriale, qui vieillit très bien.

---

## Changer les couleurs

Chaque DA est **un seul fichier** de variables :
`overlays/css/themes/signature.css`, `cobalt.css`, `mono.css`.

```css
:root{
  --accent:#1f6bff;      /* bleu principal            */
  --accent-2:#61a6ff;    /* bleu clair (accents)      */
  --bg-0:#04060e;        /* fond                      */
  --ink:#f4f8ff;         /* texte                     */
}
```

Modifie ces quatre lignes et **les 9 scènes + le stinger** suivent
(le stinger a sa propre palette dans `overlays/js/transition.js`, section
`PALETTE`).

## Créer une quatrième DA

1. Copie `overlays/css/themes/signature.css` en `ma-da.css`
2. Ajoute `'ma-da'` à la liste `DAS` en haut de `overlays/js/ui.js`
3. Ouvre n'importe quelle scène avec `?da=ma-da`
