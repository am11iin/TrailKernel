/**
 * Typed LocalStorage persistence for TrailVision.
 * Tracks 4 seasonal missions, unlocked badges, elevation gain, and Revelation access.
 */

export const STORAGE_VERSION = 3;
export const STORAGE_KEY = 'trailvision_progression_v3';
export const LEGACY_STORAGE_KEY_V2 = 'trailkernel_progression_v2';
export const LEGACY_STORAGE_KEY_V1 = 'trailkernel_progression_v1';

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonBadge {
  id: SeasonId;
  name: string;
  icon: string;
  subtitle: string;
  unlockedAt?: string;
}

export const SEASON_BADGES: Record<SeasonId, SeasonBadge> = {
  spring: {
    id: 'spring',
    name: 'Bourgeon du Printemps',
    icon: '🌸',
    subtitle: 'Alpages explorés & fleurs rares débusquées à la loupe',
  },
  summer: {
    id: 'summer',
    name: "Soleil d'Altitude",
    icon: '☀️',
    subtitle: 'Cycle solaire & mesure des 256 nuances du relief',
  },
  autumn: {
    id: 'autumn',
    name: 'Gardien des Crêtes',
    icon: '🍂',
    subtitle: 'Arêtes rocheuses & lecture de carte topo domptées',
  },
  winter: {
    id: 'winter',
    name: 'Cristal des Brumes',
    icon: '❄️',
    subtitle: 'Vision perçante à travers le grand brouillard blanc',
  },
};

export interface TrailVisionProgress {
  version: number;
  completedSeasons: SeasonId[];
  elevationGainMeters: number;
  activeSeason: SeasonId;
  revelationViewed: boolean;
  trailbotMinimized: boolean;
  // Backward compatibility fields
  completedLevels?: number[];
  unlockedCards?: number[];
  unlockedNotebooks?: number[];
}

export const DEFAULT_PROGRESS: TrailVisionProgress = {
  version: STORAGE_VERSION,
  completedSeasons: [],
  elevationGainMeters: 0,
  activeSeason: 'spring',
  revelationViewed: false,
  trailbotMinimized: false,
};

export function isRevelationUnlocked(progress: TrailVisionProgress): boolean {
  return (
    progress.completedSeasons.includes('spring') &&
    progress.completedSeasons.includes('summer') &&
    progress.completedSeasons.includes('autumn') &&
    progress.completedSeasons.includes('winter')
  );
}

export function loadProgress(): TrailVisionProgress {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_PROGRESS };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TrailVisionProgress>;
      if (parsed.version === STORAGE_VERSION) {
        return {
          version: STORAGE_VERSION,
          completedSeasons: Array.isArray(parsed.completedSeasons)
            ? (parsed.completedSeasons.filter((s) =>
                ['spring', 'summer', 'autumn', 'winter'].includes(s),
              ) as SeasonId[])
            : [],
          elevationGainMeters:
            typeof parsed.elevationGainMeters === 'number'
              ? parsed.elevationGainMeters
              : 0,
          activeSeason:
            parsed.activeSeason &&
            ['spring', 'summer', 'autumn', 'winter'].includes(parsed.activeSeason)
              ? parsed.activeSeason
              : 'spring',
          revelationViewed: Boolean(parsed.revelationViewed),
          trailbotMinimized: Boolean(parsed.trailbotMinimized),
        };
      }
    }

    // Fallback migration from legacy v2
    const rawV2 = window.localStorage.getItem(LEGACY_STORAGE_KEY_V2);
    if (rawV2) {
      const parsedV2 = JSON.parse(rawV2) as { completedLevels?: number[] };
      const completed: SeasonId[] = [];
      const levels = parsedV2.completedLevels ?? [];
      if (levels.includes(1)) completed.push('spring');
      if (levels.includes(2)) completed.push('summer');
      if (levels.includes(3)) completed.push('autumn');
      if (levels.includes(4)) completed.push('winter');

      return {
        ...DEFAULT_PROGRESS,
        completedSeasons: completed,
        elevationGainMeters: completed.length * 250,
      };
    }
  } catch {
    // Return default on corruption
  }

  return { ...DEFAULT_PROGRESS };
}

export function saveProgress(progress: TrailVisionProgress): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Non-fatal
  }
}

export function grantSeasonReward(
  progress: TrailVisionProgress,
  season: SeasonId,
): TrailVisionProgress {
  const hasSeason = progress.completedSeasons.includes(season);
  const updatedSeasons: SeasonId[] = hasSeason
    ? progress.completedSeasons
    : [...progress.completedSeasons, season];

  const updated: TrailVisionProgress = {
    ...progress,
    completedSeasons: updatedSeasons,
    elevationGainMeters: updatedSeasons.length * 250,
  };

  saveProgress(updated);
  return updated;
}

export function resetProgress(): TrailVisionProgress {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY_V2);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
    } catch {
      // Non-fatal
    }
  }
  return { ...DEFAULT_PROGRESS };
}

// -------------------------------------------------------------
// Legacy compatibility helpers for older test suites
// -------------------------------------------------------------
export type HikerRank =
  'Marcheur' | 'Randonneur' | 'Alpiniste' | 'Guide de haute montagne';

export type TrailKernelProgress = TrailVisionProgress;

export function getRankFromElevation(dPlus: number): {
  rank: HikerRank;
  badge: string;
  nextThreshold: number | null;
} {
  if (dPlus >= 1000) {
    return {
      rank: 'Guide de haute montagne',
      badge: '🎖️ Guide Suprême des 4 Saisons',
      nextThreshold: null,
    };
  }
  if (dPlus >= 750) {
    return { rank: 'Alpiniste', badge: '🧗 Alpiniste Chevronné', nextThreshold: 1000 };
  }
  if (dPlus >= 500) {
    return { rank: 'Randonneur', badge: '🥾 Randonneur Aguerri', nextThreshold: 750 };
  }
  return { rank: 'Marcheur', badge: '🌲 Marcheur Initié', nextThreshold: 500 };
}

export function grantLevelReward(
  progress: TrailKernelProgress,
  levelId: number,
  elevationPerLevel = 250,
): TrailKernelProgress {
  const seasonsMap: Record<number, SeasonId> = {
    1: 'spring',
    2: 'summer',
    3: 'autumn',
    4: 'winter',
  };
  const season = seasonsMap[levelId] ?? 'spring';
  const updated = grantSeasonReward(progress, season);
  return {
    ...updated,
    completedLevels: [...(progress.completedLevels ?? []), levelId],
    unlockedCards: [...(progress.unlockedCards ?? []), levelId],
    unlockedNotebooks: [...(progress.unlockedNotebooks ?? []), levelId],
    elevationGainMeters: (progress.elevationGainMeters || 0) + elevationPerLevel,
  };
}
