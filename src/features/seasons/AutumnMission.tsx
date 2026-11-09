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
 * Interactive Cliff Detector ("Le Détecteur de Falaises : Droite − Gauche").
 * Teaches directional gradient edge detection via the difference between opposite neighbors.
 */
function CliffDetectorDemo(): React.JSX.Element {
  const [leftAlt, setLeftAlt] = useState<number>(30);
  const [rightAlt, setRightAlt] = useState<number>(230);

  const diff = Math.abs(rightAlt - leftAlt);
  const isCliff = diff >= 120;

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-amber-100">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#b45309] flex items-center gap-1.5">
          <span>📐</span>
          <span>Expérience : Le « Détecteur de Falaises »</span>
        </h4>
        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
          Droite − Gauche
        </span>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">
        Comment la carte sait-elle où se trouve une falaise ? Elle soustrait simplement
        l'altitude du <strong>voisin de droite</strong> et du{' '}
        <strong>voisin de gauche</strong> !
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* Visual 2-cell comparison */}
        <div className="flex items-center gap-3">
          {/* Left neighbor */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-stone-500 mb-1">Gauche</span>
            <div className="w-14 h-14 rounded-xl bg-stone-100 border-2 border-stone-300 flex items-center justify-center font-mono font-black text-sm text-stone-800">
              {leftAlt} m
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={leftAlt}
              onChange={(e) => setLeftAlt(Number(e.target.value))}
              className="w-16 mt-1.5 accent-amber-600"
              aria-label="Régler l'altitude de gauche"
            />
          </div>

          <span className="text-lg font-black text-stone-400 font-sans">−</span>

          {/* Right neighbor */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-stone-500 mb-1">Droite</span>
            <div className="w-14 h-14 rounded-xl bg-stone-100 border-2 border-stone-300 flex items-center justify-center font-mono font-black text-sm text-stone-800">
              {rightAlt} m
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={rightAlt}
              onChange={(e) => setRightAlt(Number(e.target.value))}
              className="w-16 mt-1.5 accent-amber-600"
              aria-label="Régler l'altitude de droite"
            />
          </div>

          <span className="text-lg font-black text-stone-400 font-sans">=</span>

          {/* Resulting cliff indicator */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-stone-500 mb-1">Contour</span>
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono font-black text-sm transition-all shadow-md ${
                isCliff
                  ? 'bg-red-600 text-white ring-4 ring-red-200 scale-105'
                  : 'bg-stone-900 text-stone-400'
              }`}
            >
              {diff}
            </div>
            <span className="text-[9px] font-bold mt-1 text-stone-500">
              {isCliff ? '🔴 Falaise !' : '🟢 Plat'}
            </span>
          </div>
        </div>

        {/* Presets buttons */}
        <div className="space-y-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setLeftAlt(100);
              setRightAlt(100);
            }}
            className="w-full py-1.5 px-3 rounded-lg font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer block text-left"
          >
            🌱 Cas 1 : Alpage plat (100 m − 100 m = <strong>0</strong>)
          </button>
          <button
            type="button"
            onClick={() => {
              setLeftAlt(30);
              setRightAlt(230);
            }}
            className="w-full py-1.5 px-3 rounded-lg font-semibold bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 cursor-pointer block text-left"
          >
            🧗 Cas 2 : Falaise à-pic (230 m − 30 m = <strong>200</strong>)
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Mission Automne : "Les Arêtes Dorées".
 * Teaches edge detection and slope contour mapping through mountain topography.
 * Features Normal / Contours / Reinforced modes, Cliff Detector demo, and a Trail Waypoint challenge.
 */
export default function AutumnMission({
  onComplete,
  isCompleted,
}: AutumnMissionProps): React.JSX.Element {
  const [activeMode, setActiveMode] = useState<TopoMode>('normal');
  const [waypoints, setWaypoints] = useState<TrailWaypoint[]>(WAYPOINTS);
  const [testedModes, setTestedModes] = useState<Set<TopoMode>>(new Set(['normal']));

  const contoursTerrain = useMemo(() => {
    return slopeMap(AUTUMN_TERRAIN, 'clamp');
  }, []);

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

      {/* NEW: Interactive Cliff Detector Demo */}
      <CliffDetectorDemo />

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
