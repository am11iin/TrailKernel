import React, { useState, useMemo, useCallback } from 'react';
import PixelGrid from '@/components/PixelGrid';
import { generateTerrain } from '@/core/terrain';
import { slopeMap } from '@/core/slope';
import { convolve2d } from '@/core/convolve2d';
import { sharpen } from '@/core/kernels';
import TrailBot from '@/components/TrailBot';

interface AutumnMissionProps {
  onComplete: () => void;
  isCompleted: boolean;
}

const AUTUMN_SIZE = 14;
const AUTUMN_TERRAIN = generateTerrain('plateau', 88, AUTUMN_SIZE);

// 3 View modes for the topographic autumn landscape
type TopoMode = 'normal' | 'contours' | 'enhanced';

interface TrailWaypoint {
  id: number;
  name: string;
  x: number;
  y: number;
  cleared: boolean;
}

const WAYPOINTS: TrailWaypoint[] = [
  { id: 1, name: 'Col des Vents (Crête Ouest)', x: 3, y: 4, cleared: false },
  { id: 2, name: 'Brèche du Chamois (Arête Centrale)', x: 7, y: 7, cleared: false },
  { id: 3, name: 'Pic des Mélèzes (Cime Est)', x: 11, y: 9, cleared: false },
];

/**
 * Mission Automne : "Les Arêtes Dorées".
 * Teaches edge detection and slope contour mapping through mountain topography.
 * Features Normal / Contours / Reinforced modes and a Trail Waypoint challenge.
 */
export default function AutumnMission({
  onComplete,
  isCompleted,
}: AutumnMissionProps): React.JSX.Element {
  const [activeMode, setActiveMode] = useState<TopoMode>('normal');
  const [waypoints, setWaypoints] = useState<TrailWaypoint[]>(WAYPOINTS);
  const [testedModes, setTestedModes] = useState<Set<TopoMode>>(new Set(['normal']));

  // Compute contour / steepness map using pure core slopeMap
  const contoursTerrain = useMemo(() => {
    return slopeMap(AUTUMN_TERRAIN, 'clamp');
  }, []);

  // Compute sharpened relief map using pure core convolve2d
  const enhancedTerrain = useMemo(() => {
    return convolve2d(AUTUMN_TERRAIN, sharpen, { borderMode: 'clamp' });
  }, []);

  const displayedTerrain = useMemo(() => {
    if (activeMode === 'contours') return contoursTerrain;
    if (activeMode === 'enhanced') return enhancedTerrain;
    return AUTUMN_TERRAIN;
  }, [activeMode, contoursTerrain, enhancedTerrain]);

  const handleSelectMode = (mode: TopoMode) => {
    setActiveMode(mode);
    setTestedModes((prev) => {
      const next = new Set(prev);
      next.add(mode);
      return next;
    });
  };

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      setWaypoints((prev) => {
        let touched = false;
        const updated = prev.map((wp) => {
          if (!wp.cleared && Math.hypot(wp.x - x, wp.y - y) <= 1.2) {
            touched = true;
            return { ...wp, cleared: true };
          }
          return wp;
        });

        if (touched && updated.every((w) => w.cleared) && testedModes.size >= 1) {
          onComplete();
        }
        return updated;
      });
    },
    [onComplete, testedModes],
  );

  const clearedCount = useMemo(
    () => waypoints.filter((w) => w.cleared).length,
    [waypoints],
  );

  return (
    <div className="space-y-6">
      {/* Autumn Mission Banner */}
      <div className="p-4 rounded-2xl bg-[#fff7ed] border-2 border-[#ffedd5] text-stone-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Feuille d'automne">
              🍂
            </span>
            <h3 className="text-base font-black text-[#c2410c]">
              Mission Automne — La Carte des Crêtes & Contours
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ffedd5] text-[#9a3412] border border-[#fdba74]">
            {isCompleted
              ? '✓ Badge Automne Obtenu'
              : 'Badge en jeu : 🍂 Gardien des Crêtes'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          En automne, le vent fouette les arêtes rocheuses ! Basculez entre la{' '}
          <strong>vue normale</strong>, la{' '}
          <strong>carte des contours (lignes de crête)</strong> et le{' '}
          <strong>relief accentué</strong> pour repérer et sécuriser les 3 balises du
          sentier d'altitude.
        </p>
      </div>

      <TrailBot season="autumn" />

      {/* Main 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Topo Contour Map */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleSelectMode('normal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeMode === 'normal'
                  ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              🏔️ Relief naturel (Normal)
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('contours')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeMode === 'contours'
                  ? 'bg-orange-600 text-white border-orange-700 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              📐 Lignes de crêtes (Contours vifs)
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('enhanced')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeMode === 'enhanced'
                  ? 'bg-amber-900 text-white border-black shadow-sm'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              🔎 Relief renforcé (Arêtes nettes)
            </button>
          </div>

          <div className="w-full max-w-[420px] map-wood-frame rounded-2xl p-2 bg-[#fdfaf3]">
            <PixelGrid
              grid={displayedTerrain}
              cellSize={25}
              showNumbers={false}
              showGrid={true}
              colorMode={activeMode === 'contours' ? 'slopeDifficulty' : 'topo'}
              allowColorToggle={false}
              onCellClick={handleCellClick}
              ariaLabel="Relief automnal et lignes de crête"
            />
          </div>
          <p className="text-[11px] text-stone-500 mt-2 text-center italic">
            Astuce : La carte des contours fait briller les à-pics rocheux en
            rouge/orange, facilitant le repérage des 3 balises !
          </p>
        </div>

        {/* Right Column: Trail Waypoint Challenge */}
        <div className="lg:col-span-5 space-y-4">
          <div className="wood-board-panel p-4 text-white rounded-2xl relative shadow-md">
            <span className="screw-rivet-gold absolute top-2.5 left-2.5" />
            <span className="screw-rivet-gold absolute top-2.5 right-2.5" />
            <span className="screw-rivet-gold absolute bottom-2.5 left-2.5" />
            <span className="screw-rivet-gold absolute bottom-2.5 right-2.5" />

            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#a86e3f]/60">
              <span className="text-xs font-black uppercase tracking-wider text-amber-200">
                Défi du Sentier des Arêtes
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {clearedCount} / 3 balises
              </span>
            </div>

            <div className="parchment-box rounded-xl p-3 text-stone-900 space-y-2.5">
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                Activez le mode <strong>« Lignes de crêtes »</strong> pour faire ressortir
                les cassures abruptes du plateau, puis cliquez sur chaque balise du
                sentier.
              </p>

              <div className="space-y-2">
                {waypoints.map((wp) => (
                  <div
                    key={wp.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium ${
                      wp.cleared
                        ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <span>🚩 {wp.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        wp.cleared
                          ? 'bg-[#10b981] text-white'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {wp.cleared ? '✓ Validée' : 'À atteindre'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {clearedCount === waypoints.length && (
            <div className="p-3.5 rounded-2xl bg-[#dcfce7] border-2 border-[#86efac] text-[#166534] text-xs font-bold text-center shadow-xs">
              🎉 Sentier d'arête entièrement sécurisé grâce à la détection des contours !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
