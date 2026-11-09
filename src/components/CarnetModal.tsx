import React, { useState } from 'react';
import { SEASON_BADGES, type SeasonId } from '@/core/storage';

interface CarnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedSeasons: SeasonId[];
  isRevelationUnlocked: boolean;
}

const REAL_APPLICATIONS = [
  {
    season: 'spring' as SeasonId,
    title: 'Surveillance de la Flore et Parcs Nationaux',
    icon: '🌸',
    desc: 'Les drones des gardes-parcs scannent les alpages par fenêtres carrées pour compter automatiquement les colonies d’edelweiss sans piétiner le milieu naturel.',
  },
  {
    season: 'summer' as SeasonId,
    title: 'Modèles Numériques de Terrain (MNT IGN)',
    icon: '☀️',
    desc: 'L’Institut Géographique National encode chaque altitude de 0 à 255 (ou en virgule flottante) pour créer les cartes de randonnée et calculer l’ensoleillement des versants.',
  },
  {
    season: 'autumn' as SeasonId,
    title: 'Détection des Couloirs d’Avalanches & Falaises',
    icon: '🍂',
    desc: 'En calculant la dérivée de la pente entre voisins, les pisteurs-secouristes identifient instantanément les cassures de relief à plus de 30° propices aux décrochements de neige.',
  },
  {
    season: 'winter' as SeasonId,
    title: 'Vision Thermique & Secours dans le Blizzard',
    icon: '❄️',
    desc: 'Dans la tourmente ou la nuit, les caméras de secours lissent le bruit visuel des flocons de neige pour faire ressortir la silhouette thermique d’un alpiniste égaré.',
  },
];

/**
 * Carnet d'Expédition TrailVision.
 * Displays the 4 seasonal badges and real-world alpine applications.
 */
export default function CarnetModal({
  isOpen,
  onClose,
  completedSeasons,
  isRevelationUnlocked,
}: CarnetModalProps): React.JSX.Element | null {
  const [activeTab, setActiveTab] = useState<'badges' | 'applications'>('badges');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="carnet-title"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-stone-50 rounded-3xl border border-stone-300 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1f1a16] text-stone-100 flex items-center justify-between border-b border-[#472c18]">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-hidden="true">
              📓
            </span>
            <div>
              <h2
                id="carnet-title"
                className="text-lg font-black tracking-tight text-white"
              >
                Carnet d'Expédition TrailVision
              </h2>
              <p className="text-xs text-amber-200/80">
                Vos trophées saisonniers et applications réelles de haute montagne
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Fermer le carnet"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-white px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'badges'
                ? 'border-orange-600 text-orange-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🏅</span>
            <span>Mes Badges ({completedSeasons.length}/4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'border-orange-600 text-orange-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🏔️</span>
            <span>Applications Réelles de Haute Montagne</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'badges' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['spring', 'summer', 'autumn', 'winter'] as SeasonId[]).map(
                  (seasonId) => {
                    const badge = SEASON_BADGES[seasonId];
                    const isDone = completedSeasons.includes(seasonId);

                    return (
                      <div
                        key={seasonId}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDone
                            ? 'bg-white border-amber-300 shadow-sm'
                            : 'bg-stone-100/70 border-stone-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{badge.icon}</span>
                          <div>
                            <span className="font-black text-sm block text-stone-900">
                              {badge.name}
                            </span>
                            <span className="text-[11px] text-stone-500 block">
                              {badge.subtitle}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-stone-100 flex justify-between items-center text-[10px]">
                          <span className="font-semibold text-stone-500 uppercase">
                            Saison {seasonId}
                          </span>
                          <span
                            className={`font-black px-2 py-0.5 rounded-full ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-500'
                            }`}
                          >
                            {isDone ? '✓ Débloqué' : 'À accomplir'}
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              {isRevelationUnlocked && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white border border-indigo-400 shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <span className="font-black text-sm block text-indigo-200">
                        La Révélation est Déverrouillée !
                      </span>
                      <span className="text-xs text-stone-200">
                        Vous avez terminé les 4 saisons. Rejoignez le refuge pour
                        découvrir la grande révélation.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {REAL_APPLICATIONS.map((app) => (
                <div
                  key={app.title}
                  className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{app.icon}</span>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                      {app.title}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{app.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
