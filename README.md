# 🏔️ TrailVision — L'Expédition Secrète en Haute Montagne

**TrailVision** (déployé sous [trailkernel.vercel.app](https://trailkernel.vercel.app/)) est une aventure alpine interactive en 4 saisons conçue pour faire vivre l'expérience de la haute montagne à tout randonneur. 

Le randonneur découvre, étape par étape et sans aucun jargon, comment l'œil ausculte le paysage à travers 4 missions saisonnières indépendantes, avant d'atteindre la **Grande Révélation Finale** de la convolution numérique.

---

## 🧭 Les 4 Missions Saisonnières

Chaque saison est une mission de terrain fonctionnelle et rejouable :

1. 🌸 **Printemps — La Loupe Botanique** :
   - Déplacez votre loupe de repérage 3×3 sur l'alpage pour débusquer les 3 fleurs protégées (Edelweiss, Gentiane acaule, Arnica des crêtes) dissimulées sous le feuillage.
   - *Notion sous-jacente* : Le balayage spatial par fenêtre de voisinage locale 3×3.

2. ☀️ **Été — L'Échelle Solaire (0 à 255)** :
   - Faites glisser la course du soleil d'altitude (aube $\rightarrow$ zénith $\rightarrow$ crépuscule) et observez le relief s'échelonner entre l'ombre noire (`0`) et la neige éclatante (`255`).
   - Basculez entre les couleurs naturelles et la vue monochrome.
   - *Notion sous-jacente* : L'encodage matriciel d'une image en niveaux de gris 8 bits.

3. 🍂 **Automne — Les Lignes de Crêtes & Carte Topo** :
   - Basculez entre le relief naturel, la carte des contours vifs et le relief renforcé pour baliser le sentier d'arête à travers 3 cols rocheux.
   - *Notion sous-jacente* : La détection de gradient et le filtre de Sobel.

4. ❄️ **Hiver — La Brume & le Voisinage des Cimes** :
   - Ajustez l'intensité du brouillard givrant et observez comment chaque point d'altitude se fond en douceur avec ses 8 voisins immédiats.
   - *Notion sous-jacente* : Le lissage par moyenne spatiale et filtre gaussien.

---

## ⚡ La Révélation

Verrouillée jusqu'à l'obtention des 4 badges saisonniers :
- **Transition cinématique** révélant que les 4 saisons manipulées étaient en réalité les opérations fondamentales du traitement d'image et de la **convolution numérique 2D**.
- **Studio Canvas en direct** : les jumelles 3×3 balaient l'image réelle en direct avec commutation instantanée des effets (brouillard = flou, crêtes = contours Sobel, zénith = rehaussement).
- Boutons CTA : **EXPLORE AGAIN** (recommencer l'expédition) et **SHARE YOUR DISCOVERY** (partager sa découverte).

---

## 🤖 TrailBot : Le Compagnon de Route

Un guide montagnard chaleureux et humoristique qui dispense des conseils contextuels adaptés à chaque saison, minimisable à tout moment pour libérer la vue sur mobile et tablette.

---

## 🛠️ Stack Technique

- **Framework** : React 19 + TypeScript 5.7 strict (`noUncheckedIndexedAccess`, zéro `any`)
- **Bundler** : Vite 8
- **Styles** : Tailwind CSS 4 + Thèmes de saisons (variables CSS dynamiques, particules douces avec respect de `prefers-reduced-motion`)
- **Moteur Graphique** : HTML5 Canvas natif
- **Audio** : Synthèse Web Audio API pure
- **Tests** : 56 tests unitaires passés avec Vitest
- **Accessibilité & SEO** : Balises OpenGraph complètes, contrastes soignés, navigation clavier complète, Lighthouse > 90.

---

## 🚀 Lancement en Local

```bash
npm install
npm run dev
```

Ouvrez **[http://localhost:5173/](http://localhost:5173/)** dans votre navigateur.
