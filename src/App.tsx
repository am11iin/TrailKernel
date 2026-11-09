import React, { useState, useEffect } from 'react';
import { T } from '@/data/texts';
import ProgressTrail, { type ViewTarget } from '@/components/ProgressTrail';
import CarnetModal from '@/components/CarnetModal';
import HomeHero from '@/components/HomeHero';
import SpringMission from '@/features/seasons/SpringMission';
import SummerMission from '@/features/seasons/SummerMission';
import AutumnMission from '@/features/seasons/AutumnMission';
import WinterMission from '@/features/seasons/WinterMission';
import RevelationScreen from '@/features/revelation/RevelationScreen';
import { useSound } from '@/hooks/useSound';
import {
  loadProgress,
  resetProgress,
  grantSeasonReward,
  isRevelationUnlocked,
  type SeasonId,
  type TrailVisionProgress,
} from '@/core/storage';

const SEASON_ORDER: SeasonId[] = ['spring', 'summer', 'winter', 'autumn'];

/**
 * Ambient floating particles reflecting the active alpine season.
 */
function AmbientParticles({ season }: { season: ViewTarget }): React.JSX.Element {
  const icon =
    season === 'spring'
      ? '🌸'
      : season === 'summer'
        ? '✨'
        : season === 'autumn'
          ? '🍂'
          : season === 'winter'
            ? '❄️'
            : '⚡';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <span
        className="floating-particle text-sm"
        style={{ left: '8%', bottom: '10%', animationDelay: '0s' }}
      >
        {icon}
      </span>
      <span
        className="floating-particle text-base"
        style={{ left: '22%', bottom: '25%', animationDelay: '2.5s' }}
      >
        {icon}
      </span>
      <span
        className="floating-particle text-sm"
        style={{ left: '78%', bottom: '15%', animationDelay: '1.2s' }}
      >
        {icon}
      </span>
      <span
        className="floating-particle text-lg"
        style={{ left: '90%', bottom: '30%', animationDelay: '3.8s' }}
      >
        {icon}
      </span>
    </div>
  );
}

export default function App(): React.JSX.Element {
  const [progress, setProgress] = useState<TrailVisionProgress>(() => loadProgress());
  const [activeSeason, setActiveSeason] = useState<SeasonId>('spring');
  const [view, setView] = useState<'home' | 'trail' | 'revelation'>('trail');
  const [isCarnetOpen, setIsCarnetOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const { enabled: soundEnabled, toggle: toggleSound } = useSound();

  useEffect(() => {
    if (progress.activeSeason) {
      setActiveSeason(progress.activeSeason);
    }
  }, [progress.activeSeason]);

  const handleSeasonComplete = (season: SeasonId) => {
    setProgress((prev) => grantSeasonReward(prev, season));
  };

  const handleSelectSeason = (season: SeasonId) => {
    setActiveSeason(season);
    setView('trail');
  };

  const handleSelectRevelation = () => {
    if (isRevelationUnlocked(progress)) {
      setView('revelation');
    }
  };

  const handleReset = () => {
    const fresh = resetProgress();
    setProgress(fresh);
    setActiveSeason('spring');
    setView('home');
    setShowResetConfirm(false);
  };

  const revelationReady = isRevelationUnlocked(progress);
  const isCurrentSeasonCompleted = progress.completedSeasons.includes(activeSeason);

  // Determine next season
  const currentIndex = SEASON_ORDER.indexOf(activeSeason);
  const nextSeason =
    currentIndex < SEASON_ORDER.length - 1 ? SEASON_ORDER[currentIndex + 1] : null;

  const currentViewTarget: ViewTarget =
    view === 'revelation' ? 'revelation' : activeSeason;

  return (
    <div
      className={`min-h-screen bg-topo-mountain-theme flex flex-col text-stone-900 font-sans selection:bg-orange-200 theme-${
        view === 'revelation' ? 'revelation' : activeSeason
      }`}
    >
      <AmbientParticles season={currentViewTarget} />

      {/* Top Alpine Header (Dark timber look) */}
      <header className="bg-[#1f1a16] text-stone-100 border-b-2 border-[#472c18] shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & title */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setView('home')}
              className="text-2xl hover:scale-110 transition-transform cursor-pointer"
              aria-label="Retour au camp de base"
            >
              🏔️
            </button>
            <div>
              <button
                type="button"
                onClick={() => setView('home')}
                className="text-left cursor-pointer group"
              >
                <h1 className="text-lg font-black tracking-tight leading-tight text-white group-hover:text-orange-400 transition-colors">
                  {T.app.title}
                </h1>
                <p className="text-[11px] text-stone-400 hidden sm:block">
                  {T.app.subtitle}
                </p>
              </button>
            </div>
          </div>

          {/* Gamification Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
            {/* Elevation gain badge */}
            <div
              className="flex items-center gap-1.5 bg-[#2c221a] px-3 py-1.5 rounded-lg border border-[#4d3828] text-stone-200 shadow-xs"
              title="Dénivelé positif accumulé"
            >
              <span className="text-orange-400 font-bold">▲</span>
              <span className="font-bold text-white">{progress.elevationGainMeters}</span>
              <span className="text-stone-400 text-[10px]">m D+</span>
            </div>

            {/* Badges count */}
            <div
              className="hidden md:flex items-center gap-1.5 bg-[#2c221a] px-3 py-1.5 rounded-lg border border-[#4d3828] text-stone-300 font-sans font-semibold shadow-xs"
              title="Badges de saisons débloqués"
            >
              <span>🏅 {progress.completedSeasons.length} / 4 Badges</span>
            </div>

            {/* Carnet d'expédition trigger */}
            <button
              type="button"
              onClick={() => setIsCarnetOpen(true)}
              className="px-3 py-1.5 rounded-lg font-sans font-semibold text-xs bg-[#2c221a] hover:bg-[#3d2e23] text-stone-200 border border-[#4d3828] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              aria-label="Ouvrir le carnet d'expédition"
            >
              <span>📓</span>
              <span className="hidden sm:inline">Carnet</span>
            </button>

            {/* Home / Seasons Toggle */}
            <button
              type="button"
              onClick={() => setView((v) => (v === 'home' ? 'trail' : 'home'))}
              className="px-3 py-1.5 rounded-lg font-sans font-bold text-xs bg-orange-600 hover:bg-orange-500 text-white transition-colors cursor-pointer shadow-xs"
            >
              {view === 'home' ? 'Sentier →' : 'Camp de Base'}
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border text-sm transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-800 border-emerald-600 text-emerald-200'
                  : 'bg-[#2c221a] border-[#4d3828] text-stone-400 hover:text-stone-200'
              }`}
              title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
              aria-label="Contrôle du son altimétrique"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer"
              title="Réinitialiser l'expédition"
              aria-label="Réinitialiser l'expédition"
            >
              🔄
            </button>
          </div>
        </div>
      </header>

      {/* Progress Trail Stepper Bar */}
      {view !== 'home' && (
        <div className="bg-[#fcf8f0]/95 border-b border-[#e2d5bf] shadow-xs backdrop-blur-xs relative z-10">
          <div className="max-w-6xl mx-auto px-2">
            <ProgressTrail
              currentView={currentViewTarget}
              completedSeasons={progress.completedSeasons}
              isRevelationUnlocked={revelationReady}
              onSelect={(target) => {
                if (target === 'revelation') {
                  setView('revelation');
                } else {
                  handleSelectSeason(target);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1 relative z-10">
        {/* Onboarding Guide Box (Authentic Carved Wood Park Signboard) */}
        {showGuide && view !== 'revelation' && (
          <div className="mb-6 wood-board-panel p-4 sm:p-5 text-white relative shadow-lg">
            <span className="screw-rivet-gold absolute top-2.5 left-2.5" />
            <span className="screw-rivet-gold absolute top-2.5 right-2.5" />
            <span className="screw-rivet-gold absolute bottom-2.5 left-2.5" />
            <span className="screw-rivet-gold absolute bottom-2.5 right-2.5" />

            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#a86e3f]/60">
              <div className="flex items-center gap-2 pl-2">
                <span className="text-base text-amber-300" aria-hidden="true">
                  🧭
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-200">
                  {T.howToPlay.badge} — 4 Saisons, 4 Mystères
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-xs text-amber-200 hover:text-white font-bold px-2.5 py-1 rounded cursor-pointer transition-colors"
                title="Masquer le guide"
              >
                ✕ Masquer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-stone-900">
              <div className="parchment-box p-3.5 rounded-xl space-y-1.5 shadow-xs">
                <p className="font-black text-[#7a4115] text-[13px]">
                  {T.howToPlay.step1Title}
                </p>
                <p className="text-stone-700 leading-relaxed text-[11px] sm:text-xs">
                  {T.howToPlay.step1Desc}
                </p>
              </div>

              <div className="parchment-box p-3.5 rounded-xl space-y-1.5 shadow-xs">
                <p className="font-black text-[#7a4115] text-[13px]">
                  {T.howToPlay.step2Title}
                </p>
                <p className="text-stone-700 leading-relaxed text-[11px] sm:text-xs">
                  {T.howToPlay.step2Desc}
                </p>
              </div>

              <div className="parchment-box p-3.5 rounded-xl space-y-1.5 shadow-xs">
                <p className="font-black text-[#7a4115] text-[13px]">
                  {T.howToPlay.step3Title}
                </p>
                <p className="text-stone-700 leading-relaxed text-[11px] sm:text-xs">
                  {T.howToPlay.step3Desc}
                </p>
              </div>
            </div>
          </div>
        )}

        {view === 'home' ? (
          <HomeHero
            progress={progress}
            onSelectSeason={handleSelectSeason}
            onSelectRevelation={handleSelectRevelation}
            onOpenNotebook={() => setIsCarnetOpen(true)}
          />
        ) : view === 'revelation' ? (
          <RevelationScreen
            onRestart={handleReset}
            onOpenNotebook={() => setIsCarnetOpen(true)}
          />
        ) : (
          <section className="bg-white rounded-3xl border border-[#ded0b4] shadow-md p-5 sm:p-8 space-y-6">
            {/* Active Season Interactive Mission */}
            {activeSeason === 'spring' && (
              <SpringMission
                onComplete={() => handleSeasonComplete('spring')}
                isCompleted={isCurrentSeasonCompleted}
              />
            )}
            {activeSeason === 'summer' && (
              <SummerMission
                onComplete={() => handleSeasonComplete('summer')}
                isCompleted={isCurrentSeasonCompleted}
              />
            )}
            {activeSeason === 'autumn' && (
              <AutumnMission
                onComplete={() => handleSeasonComplete('autumn')}
                isCompleted={isCurrentSeasonCompleted}
              />
            )}
            {activeSeason === 'winter' && (
              <WinterMission
                onComplete={() => handleSeasonComplete('winter')}
                isCompleted={isCurrentSeasonCompleted}
              />
            )}

            {/* Bottom Navigation Buttons */}
            <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-semibold text-stone-600">
                {isCurrentSeasonCompleted ? (
                  <span className="text-emerald-800 font-extrabold flex items-center gap-1.5">
                    <span>✓</span>
                    <span>Mission de saison accomplie ! Badge obtenu.</span>
                  </span>
                ) : (
                  <span>Accomplissez l'objectif pour obtenir le badge saisonnier.</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {nextSeason ? (
                  <button
                    type="button"
                    onClick={() => handleSelectSeason(nextSeason)}
                    className="px-6 py-3 rounded-xl font-black text-xs sm:text-sm bg-orange-600 hover:bg-orange-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-2 transform active:scale-95"
                  >
                    <span>Saison suivante ({T.seasons[nextSeason].title}) →</span>
                  </button>
                ) : revelationReady ? (
                  <button
                    type="button"
                    onClick={handleSelectRevelation}
                    className="px-7 py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl transition-all cursor-pointer flex items-center gap-2 transform active:scale-95 animate-pulse"
                  >
                    <span>⚡ Découvrir la Révélation Finale →</span>
                  </button>
                ) : null}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-5 px-4 text-xs text-stone-600 border-t border-[#ded0b4] bg-[#fbf7ee] relative z-10">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>TrailVision — Les 4 saisons de haute montagne</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCarnetOpen(true)}
              className="text-stone-700 hover:text-stone-900 underline font-medium cursor-pointer"
            >
              Carnet d'expédition
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setView('home')}
              className="text-stone-700 hover:text-stone-900 underline font-medium cursor-pointer"
            >
              Camp de Base
            </button>
          </div>
        </div>
      </footer>

      {/* Carnet Modal */}
      <CarnetModal
        isOpen={isCarnetOpen}
        onClose={() => setIsCarnetOpen(false)}
        completedSeasons={progress.completedSeasons}
        isRevelationUnlocked={revelationReady}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-stone-300 p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-stone-900">
              Réinitialiser l'expédition ?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tous vos badges saisonniers, votre dénivelé accumulé et l'accès à la
              Révélation seront remis à zéro.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Confirmer la réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
