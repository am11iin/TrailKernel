/**
 * French texts for TrailVision.
 * Strict mountain hiking immersion across 4 seasons without any spoiler or technical jargon
 * before the final revelation.
 * Includes legacy compatibility exports for unused components.
 */

export interface RecapCard {
  levelId: number;
  badge: string;
  title: string;
  takeaway: string;
}

export interface MiniQuestion {
  levelId: number;
  question: string;
  options: Array<{ id: string; label: string; correct: boolean }>;
  explanation: string;
}

export const T = {
  app: {
    title: 'TrailVision',
    subtitle: 'L’expédition secrète à travers les 4 saisons de haute montagne',
  },
  seasons: {
    spring: {
      id: 'spring',
      title: 'Printemps',
      subtitle: 'La Loupe Botanique',
      icon: '🌸',
      description:
        'L’alpage se réveille ! Utilisez votre loupe de repérage carrée pour débusquer les 3 fleurs rares dissimulées sous le feuillage.',
      objective: 'Localiser les 3 fleurs protégées à la loupe.',
      badgeName: 'Bourgeon du Printemps',
    },
    summer: {
      id: 'summer',
      title: 'Été',
      subtitle: 'L’Échelle Solaire',
      icon: '☀️',
      description:
        'Le soleil d’altitude inonde la montagne. Observez l’ombre et la clarté s’échelonner de 0 (gorge d’ombre) à 255 (neige éclatante).',
      objective: 'Faire varier la course du soleil et sonder 4 points de roche.',
      badgeName: 'Soleil d’Altitude',
    },
    autumn: {
      id: 'autumn',
      title: 'Automne',
      subtitle: 'Les Arêtes & Contours',
      icon: '🍂',
      description:
        'Le vent souffle sur les crêtes. Basculez en vue de contours pour repérer les parois abruptes et baliser le sentier d’arête.',
      objective: 'Afficher les contours rocheux et valider les 3 balises.',
      badgeName: 'Gardien des Crêtes',
    },
    winter: {
      id: 'winter',
      title: 'Hiver',
      subtitle: 'La Brume des Cimes',
      icon: '❄️',
      description:
        'Le grand blizzard enveloppe le massif. Dans la brume, chaque point se fond en douceur avec ses 8 voisins immédiats pour lisser le paysage.',
      objective: 'Ajuster l’intensité du brouillard et sonder le voisinage.',
      badgeName: 'Cristal des Brumes',
    },
  },
  howToPlay: {
    badge: 'Guide du Randonneur',
    step1Title: '🌸 1. Printemps : La Loupe',
    step1Desc:
      'Glissez votre loupe carrée pour ausculter le relief et observer les détails cachés de l’alpage.',
    step2Title: '☀️ 2. Été : Les 256 Nuances',
    step2Desc:
      'Chaque mètre de montagne reflète la lumière selon une cote précise allant de 0 à 255.',
    step3Title: '🍂 3. Automne & Hiver',
    step3Desc:
      'Révélez les lignes de crêtes vertigineuses et apprenez comment la brume adoucit les parois.',
  },
  nav: {
    home: 'Camp de Base',
    seasons: 'Les 4 Saisons',
    revelation: '⚡ La Révélation',
    notebook: 'Carnet d’expédition',
    reset: 'Réinitialiser',
    levels: 'Sentier des Saisons',
    progress: 'Progression de l’expédition',
  },
  gamification: {
    dPlus: 'Dénivelé positif (D+)',
    badges: 'Badges des Saisons',
    elevationUnit: 'm D+',
    rank: 'Rang d’alpiniste',
  },
  sound: {
    enable: 'Activer l’altimètre sonore',
    disable: 'Désactiver le son',
  },
  contours: {
    toggle: 'Palette topo / Niveaux de gris',
  },

  // -------------------------------------------------------------------------
  // Legacy compatibility structures for auxiliary components
  // -------------------------------------------------------------------------
  level: {
    locked: '🔒 Verrouillé',
    complete: '✓ Accomplie',
    start: 'Commencer',
    next: 'Étape suivante →',
    success: 'Objectif atteint !',
    tryAgain: 'Réessayer',
    difficulty: {
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile',
    },
  },
  levels: [
    {
      id: 1,
      title: '1. Lire la carte',
      difficulty: 'Facile',
      objective: 'Comprendre que chaque point est une altitude.',
      instructions: 'Cliquez sur 6 cases.',
      description: 'Chaque case est un pixel de 0 à 255.',
      successMessage: 'Vous comprenez la grille numérique.',
      requiredClicks: 6,
    },
    {
      id: 2,
      title: '2. La fenêtre 3×3',
      difficulty: 'Moyen',
      objective: 'Observer les 8 voisins immédiats.',
      instructions: 'Valider 4 calculs.',
      description: 'Calculer un point avec ses 8 voisins.',
      successMessage: 'Calculs validés !',
    },
    {
      id: 3,
      title: '3. Flou & Poids',
      difficulty: 'Moyen',
      objective: 'Comprendre la moyenne et le diviseur.',
      instructions: 'Répondez aux questions.',
      description: 'Le rôle de la division.',
      successMessage: 'Étalonnage réussi !',
    },
    {
      id: 4,
      title: '4. Les Crêtes',
      difficulty: 'Difficile',
      objective: 'Détecter les parois abruptes.',
      instructions: 'Touchez la zone la plus raide.',
      description: 'La détection des contours.',
      successMessage: 'Falaise localisée !',
    },
    {
      id: 5,
      title: '5. L’Atelier',
      difficulty: 'Difficile',
      objective: 'Expérimenter les filtres.',
      instructions: 'Testez 3 outils.',
      description: 'L’atelier complet.',
      successMessage: 'Atelier terminé !',
    },
  ],
  filters: {
    boxBlur: { name: 'Moyenne (Brouillard)' },
    gaussian: { name: 'Brume douce' },
    sharpen: { name: 'Relief net' },
    laplacian: { name: 'Contours fins' },
    emboss: { name: 'Ombrage relief' },
    sobelX: { name: 'Pentes Est-Ouest' },
    sobelY: { name: 'Pentes Nord-Sud' },
    slope: { name: 'Carte des falaises' },
  },
  calculator: {
    title: 'Pupitre de calcul transparent',
    direction: 'Position',
    pixel: 'Altitude',
    coeff: 'Poids',
    product: 'Produit',
    sum: 'Somme',
    divisor: 'Diviseur',
    result: 'Résultat final',
    divided: 'Division',
    offset: 'Décalage',
    clamped: 'Écrêtage (0-255)',
  },
  quiz: {
    same: 'Identique',
    higher: 'Plus haut',
    lower: 'Plus bas',
    submit: 'Valider',
    correct: 'Bonne réponse !',
    incorrect: 'Réessayez',
    wrong: 'Faux',
  },
  borderModes: {
    clamp: { name: 'Répéter le bord', description: 'Duplique la dernière altitude.' },
    zero: { name: 'Zéro', description: 'Considère l’extérieur comme un abîme noir.' },
    wrap: { name: 'Boucler', description: 'Fait le tour de la carte comme un tore.' },
  },
  notebook: [
    { title: 'Topographie', summary: 'Cartographie MNT' },
    { title: 'Secours', summary: 'Drones alpins' },
    { title: 'Avalanches', summary: 'Pentes critiques' },
    { title: 'Vision', summary: 'Lissage de brume' },
  ],
  finalSummary: {
    title: 'Ce que tu sais maintenant',
    subtitle: 'Bilan de l’expédition',
    button: 'Terminer',
    openCarnet: 'Ouvrir le carnet',
  },
  recapCards: [] as RecapCard[],
  miniQuestions: [] as MiniQuestion[],
};
