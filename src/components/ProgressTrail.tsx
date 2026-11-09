import React from 'react';
import type { SeasonId } from '@/core/storage';

export type ViewTarget = SeasonId | 'revelation';

interface ProgressTrailProps {
  currentView: ViewTarget;
  completedSeasons: SeasonId[];
  isRevelationUnlocked: boolean;
  onSelect: (target: ViewTarget) => void;
}

const SEASONS_LIST: Array<{
  id: SeasonId;
  title: string;
  badge: string;
  difficulty: string;
  icon: string;
}> = [
  {
    id: 'spring',
    title: '1. Printemps',
    badge: 'LA LOUPE',
    difficulty: 'Tr. Facile',
    icon: '🌸',
  },
  { id: 'summer', title: '2. Été', badge: '0 À 255', difficulty: 'Facile', icon: '☀️' },
  { id: 'winter', title: '3. Hiver', badge: 'LA BRUME', difficulty: 'Moyen', icon: '❄️' },
  {
    id: 'autumn',
    title: '4. Automne',
    badge: 'LES CRÊTES',
    difficulty: 'Avancé',
    icon: '🍂',
  },
];

/**
 * Detailed Mountain Peak Illustration matching the rustic alpine theme.
 */
function MountainGraphic(): React.JSX.Element {
  return (
    <div className="shrink-0 flex items-center justify-center mr-2 select-none">
      <svg
        width="82"
        height="56"
        viewBox="0 0 90 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
        aria-hidden="true"
      >
        <path
          d="M2 56 C 20 48, 45 52, 70 50 C 78 49, 86 52, 88 56 L 88 58 L 2 58 Z"
          fill="#4f883c"
        />
        <polygon points="10,56 28,24 46,56" fill="#8f7e6e" />
        <polygon points="28,24 35,34 28,32 22,35" fill="#ffffff" />
        <polygon points="46,56 65,28 82,56" fill="#7a6c5e" />
        <polygon points="65,28 71,36 65,34 60,37" fill="#ffffff" />
        <polygon points="18,56 42,10 66,56" fill="#675647" />
        <polygon points="18,56 42,10 42,56" fill="#57473a" />
        <polygon
          points="42,10 52,26 47,24 42,28 36,23 32,27 30,22 42,10"
          fill="#ffffff"
        />
        <polygon points="42,10 42,28 36,23 32,27 30,22" fill="#e2e8f0" />
        <path d="M8 55 L11 48 L14 55 Z" fill="#204b19" />
        <path d="M72 55 L75 49 L78 55 Z" fill="#204b19" />
      </svg>
    </div>
  );
}

/**
 * ProgressTrail — Navigation between the 4 Seasons (ordered easiest to hardest) and the Revelation.
 */
export default function ProgressTrail({
  currentView,
  completedSeasons,
  isRevelationUnlocked,
  onSelect,
}: ProgressTrailProps): React.JSX.Element {
  return (
    <nav aria-label="Sentier des Saisons" className="w-full py-2.5">
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        <MountainGraphic />

        <ol className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          {SEASONS_LIST.map((season, idx) => {
            const isCurrent = currentView === season.id;
            const isCompleted = completedSeasons.includes(season.id);

            return (
              <li key={season.id} className="flex items-center">
                {idx > 0 && (
                  <div className="flex items-center px-1 select-none" aria-hidden="true">
                    <span className="border-b-2 border-dashed border-[#b89f82] w-3 sm:w-5 inline-block" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onSelect(season.id)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`group relative flex flex-col items-center justify-between rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 transition-all cursor-pointer min-w-[110px] sm:min-w-[125px] h-[68px] ${
                    isCurrent
                      ? 'bg-gradient-to-b from-[#ffeed2] to-[#fedfa6] text-stone-900 border-2 border-orange-500 shadow-md ring-2 ring-orange-300 ring-offset-1 font-bold'
                      : isCompleted
                        ? 'bg-gradient-to-b from-[#fbf4e5] to-[#f4e4c9] text-stone-800 border border-[#c9b292] hover:border-orange-400 shadow-xs'
                        : 'bg-[#fffaf0] text-stone-700 border border-[#dfd2be] hover:border-orange-400 shadow-xs'
                  }`}
                >
                  {isCompleted && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#16a34a] text-white text-[10px] flex items-center justify-center font-black shadow-xs ring-1 ring-white"
                      title="Saison accomplie"
                    >
                      ✓
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 text-center mt-0.5 w-full justify-center">
                    <span className="text-sm shrink-0">{season.icon}</span>
                    <span
                      className={`text-[11px] sm:text-xs leading-tight line-clamp-1 ${
                        isCurrent ? 'font-black text-stone-950' : 'font-semibold'
                      }`}
                    >
                      {season.title}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full mt-1 ${
                      isCurrent
                        ? 'bg-orange-500 text-white shadow-xs'
                        : isCompleted
                          ? 'bg-[#ded0b6] text-stone-800'
                          : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {season.badge}
                  </span>
                </button>
              </li>
            );
          })}

          {/* Dotted separator to Revelation */}
          <li className="flex items-center">
            <div className="flex items-center px-1 select-none" aria-hidden="true">
              <span className="border-b-2 border-dashed border-[#818cf8] w-3 sm:w-5 inline-block" />
            </div>

            <button
              type="button"
              disabled={!isRevelationUnlocked}
              onClick={() => isRevelationUnlocked && onSelect('revelation')}
              className={`group relative flex flex-col items-center justify-between rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 transition-all min-w-[115px] sm:min-w-[135px] h-[68px] ${
                !isRevelationUnlocked
                  ? 'bg-stone-200/70 text-stone-400 border border-stone-300 cursor-not-allowed opacity-75'
                  : currentView === 'revelation'
                    ? 'bg-gradient-to-b from-[#312e81] to-[#1e1b4b] text-white border-2 border-indigo-400 shadow-xl ring-2 ring-indigo-300 ring-offset-1 font-bold'
                    : 'bg-gradient-to-b from-[#4338ca] to-[#312e81] text-indigo-100 border border-indigo-400 hover:border-indigo-300 shadow-md cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-1.5 text-center mt-0.5 w-full justify-center">
                <span className="text-sm shrink-0">
                  {!isRevelationUnlocked ? '🔒' : '⚡'}
                </span>
                <span className="text-[11px] sm:text-xs leading-tight font-black">
                  La Révélation
                </span>
              </div>

              <span
                className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full mt-1 ${
                  !isRevelationUnlocked
                    ? 'bg-stone-300 text-stone-600'
                    : 'bg-indigo-500 text-white shadow-xs'
                }`}
              >
                {!isRevelationUnlocked ? '4 SAISONS REQUISES' : 'DÉBLOQUÉE !'}
              </span>
            </button>
          </li>
        </ol>
      </div>
    </nav>
  );
}
