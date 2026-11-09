import React, { useState, useMemo, useCallback } from 'react';
import PixelGrid from '@/components/PixelGrid';
import { generateTerrain } from '@/core/terrain';
import { convolve2d } from '@/core/convolve2d';
import { boxBlur, gaussian } from '@/core/kernels';
import { getPixel } from '@/core/grid';
import TrailBot from '@/components/TrailBot';

interface WinterMissionProps {
  onComplete: () => void;
  isCompleted: boolean;
}

const WINTER_SIZE = 14;
const BASE_WINTER_TERRAIN = generateTerrain('massif', 99, WINTER_SIZE);

type FogPreset = 'clear' | 'light' | 'dense';

const DIRECTIONS = [
  { name: 'NO ↖', dx: -1, dy: -1 },
  { name: 'N ↑', dx: 0, dy: -1 },
  { name: 'NE ↗', dx: 1, dy: -1 },
  { name: 'O ←', dx: -1, dy: 0 },
  { name: 'Centre •', dx: 0, dy: 0 },
  { name: 'E →', dx: 1, dy: 0 },
  { name: 'SO ↙', dx: -1, dy: 1 },
  { name: 'S ↓', dx: 0, dy: 1 },
  { name: 'SE ↘', dx: 1, dy: 1 },
];

/**
 * Interactive Peak Planer demonstration ("Le Raboteur de Sommet").
 * Shows how averaging 9 cells erases an isolated high peak.
 */
function PeakPlanerDemo(): React.JSX.Element {
  const [isSmoothed, setIsSmoothed] = useState(false);

  // An isolated peak at 220 m surrounded by 8 valley points at 40 m
  const valleyVal = 40;
  const initialPeak = 220;
  const smoothedVal = Math.round((valleyVal * 8 + initialPeak) / 9); // = 60 m

  return (
    <div className="rounded-2xl border-2 border-sky-300 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-sky-100">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#0284c7] flex items-center gap-1.5">
          <span>🔨</span>
          <span>Expérience : Le « Raboteur de Sommet »</span>
        </h4>
        <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
          Comprendre la moyenne
        </span>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">
        Imaginez un pic rocheux pointu qui culmine à <strong>220 m</strong>, entouré de
        vallées calmes à <strong>40 m</strong>. Regardez ce qui arrive quand la brume fait
        la moyenne des 9 cases :
      </p>

      {/* 3x3 Mini Grid Diagram */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
        <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-sky-50 border border-sky-200 text-center font-mono text-xs">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const isCenter = i === 4;
            const val = isCenter ? (isSmoothed ? smoothedVal : initialPeak) : valleyVal;
            return (
              <div
                key={i}
                className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg font-black transition-all duration-500 ${
                  isCenter
                    ? isSmoothed
                      ? 'bg-emerald-600 text-white scale-105 shadow-md'
                      : 'bg-rose-600 text-white animate-pulse shadow-md'
                    : 'bg-white text-stone-700 border border-sky-200'
                }`}
              >
                <span className="text-[9px] opacity-75">
                  {isCenter ? 'Pic' : 'Vallée'}
                </span>
                <span>{val}</span>
              </div>
            );
          })}
        </div>

        {/* Calculation breakdown */}
        <div className="text-xs text-stone-700 space-y-1.5 font-medium max-w-xs text-center sm:text-left">
          <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 font-mono text-[11px]">
            {isSmoothed ? (
              <span className="text-emerald-700 font-bold">
                (40×8 + 220) ÷ 9 = <strong>60 m</strong> !
              </span>
            ) : (
              <span className="text-stone-500">Pic isolé à 220 m (fort contraste)</span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 leading-tight">
            {isSmoothed
              ? '✨ Le pic est raboté de 220 m à 60 m : le relief devient doux et harmonieux !'
              : 'Cliquez ci-dessous pour déclencher la moyenne des 9 cases :'}
          </p>

          <button
            type="button"
            onClick={() => setIsSmoothed((s) => !s)}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
              isSmoothed
                ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md'
            }`}
          >
            {isSmoothed
              ? '↺ Revenir au relief brut (220 m)'
              : '🌫️ Déclencher la brume (Faire la moyenne)'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Mission Hiver : "Le Grand Brouillard Blanc".
 * Teaches spatial neighborhood averaging and smoothing through the metaphor of alpine fog.
 * Features Clear/Light/Dense presets, fog intensity slider, and the Peak Planer interactive demo.
 */
export default function WinterMission({
  onComplete,
  isCompleted,
}: WinterMissionProps): React.JSX.Element {
  const [activePreset, setActivePreset] = useState<FogPreset>('light');
  const [fogPasses, setFogPasses] = useState<number>(1);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>({
    x: 6,
    y: 6,
  });
  const [testedPresets, setTestedPresets] = useState<Set<FogPreset>>(new Set(['light']));

  // Compute terrain with successive fog smoothing passes
  const foggedTerrain = useMemo(() => {
    if (activePreset === 'clear') return BASE_WINTER_TERRAIN;

    const kernel = activePreset === 'light' ? gaussian : boxBlur;
    let current = BASE_WINTER_TERRAIN;

    for (let p = 0; p < fogPasses; p++) {
      current = convolve2d(current, kernel, { borderMode: 'clamp' });
    }
    return current;
  }, [activePreset, fogPasses]);

  const handleSelectPreset = (preset: FogPreset) => {
    setActivePreset(preset);
    setTestedPresets((prev) => {
      const next = new Set(prev);
      next.add(preset);
      if (next.size >= 2) {
        onComplete();
      }
      return next;
    });
  };

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      setSelectedCell({ x, y });
      if (testedPresets.size >= 2) {
        onComplete();
      }
    },
    [testedPresets, onComplete],
  );

  const neighborhoodValues = useMemo(() => {
    if (!selectedCell) return null;
    return DIRECTIONS.map((dir) => {
      return {
        name: dir.name,
        value: getPixel(
          BASE_WINTER_TERRAIN,
          selectedCell.x + dir.dx,
          selectedCell.y + dir.dy,
          'clamp',
        ),
      };
    });
  }, [selectedCell]);

  const smoothedCenterValue = useMemo(() => {
    if (!selectedCell) return 0;
    return getPixel(foggedTerrain, selectedCell.x, selectedCell.y, 'clamp');
  }, [selectedCell, foggedTerrain]);

  return (
    <div className="space-y-6">
      {/* Winter Mission Banner */}
      <div className="p-4 rounded-2xl bg-[#f0f9ff] border-2 border-[#bae6fd] text-stone-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Flocon de neige">
              ❄️
            </span>
            <h3 className="text-base font-black text-[#0284c7]">
              Mission Hiver — La Brume & le Voisinage des Cimes
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]">
            {isCompleted
              ? '✓ Badge Hiver Obtenu'
              : 'Badge en jeu : ❄️ Cristal des Brumes'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          Dans le blizzard d'altitude, les rochers saillants s'adoucissent sous une nappe
          de brume. Ajustez l'intensité du brouillard et observez comment chaque point{' '}
          <strong>fait la paix avec ses 8 voisins immédiats</strong> pour lisser le
          paysage.
        </p>
      </div>

      <TrailBot season="winter" />

      {/* NEW: Interactive Peak Planer Demo */}
      <PeakPlanerDemo />

      {/* Main 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Fog-Covered Terrain Map */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleSelectPreset('clear')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activePreset === 'clear'
                  ? 'bg-sky-800 text-white border-sky-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              🏔️ Temps clair (Net)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('light')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activePreset === 'light'
                  ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              🌫️ Brume légère (Gaussienne douce)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('dense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activePreset === 'dense'
                  ? 'bg-slate-700 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              ☁️ Brouillard dense (Lissage complet)
            </button>
          </div>

          <div className="w-full max-w-[420px] map-wood-frame rounded-2xl p-2 bg-[#fdfaf3]">
            <PixelGrid
              grid={foggedTerrain}
              cellSize={25}
              showNumbers={false}
              showGrid={true}
              useTopo={true}
              highlightWindow={selectedCell}
              onCellClick={handleCellClick}
              ariaLabel="Massif hivernal sous le brouillard"
            />
          </div>
          <p className="text-[11px] text-stone-500 mt-2 text-center italic">
            Cliquez sur un point de la carte pour observer comment la brume fusionne ses 8
            voisins.
          </p>
        </div>

        {/* Right Column: Fog Density Slider & 3x3 Neighborhood Diagram */}
        <div className="lg:col-span-5 space-y-4">
          {/* Fog Density Slider */}
          <div className="wood-board-panel p-4 text-white rounded-2xl relative shadow-md">
            <span className="screw-rivet-gold absolute top-2.5 left-2.5" />
            <span className="screw-rivet-gold absolute top-2.5 right-2.5" />
            <span className="screw-rivet-gold absolute bottom-2.5 left-2.5" />
            <span className="screw-rivet-gold absolute bottom-2.5 right-2.5" />

            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#a86e3f]/60">
              <span className="text-xs font-black uppercase tracking-wider text-amber-200">
                Densité du Brouillard d'Altitude
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {activePreset === 'clear'
                  ? '0 passe'
                  : `${fogPasses} passe${fogPasses > 1 ? 's' : ''}`}
              </span>
            </div>

            <div className="parchment-box rounded-xl p-3 text-stone-900 space-y-2">
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={fogPasses}
                disabled={activePreset === 'clear'}
                onChange={(e) => setFogPasses(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer disabled:opacity-40"
                aria-label="Régler l'intensité du brouillard"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-bold">
                <span>Voile léger</span>
                <span>Brouillard givrant</span>
                <span>Blizzard blanc total</span>
              </div>
            </div>
          </div>

          {/* Schéma du Voisinage des 8 Voisins */}
          <div className="rounded-2xl border-2 border-[#bae6fd] bg-white p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0284c7]">
              Schéma du Voisinage Immédiat (3×3 cases)
            </h4>
            <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
              Dans la tourmente, le point central <strong>n'est plus seul</strong> : il
              prend la teinte moyenne des 8 points qui l'entourent.
            </p>

            {neighborhoodValues && (
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#f0f9ff] rounded-xl border border-[#bae6fd] text-center font-mono">
                {neighborhoodValues.map((cell, idx) => {
                  const isCenter = idx === 4;
                  return (
                    <div
                      key={cell.name}
                      className={`p-2 rounded-lg text-xs font-bold border transition-colors ${
                        isCenter
                          ? 'bg-[#0284c7] text-white border-[#0369a1] shadow-xs'
                          : 'bg-white text-stone-700 border-sky-200'
                      }`}
                    >
                      <span className="block text-[9px] opacity-75">{cell.name}</span>
                      <span className="block text-sm">{cell.value}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedCell && (
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 font-medium text-center">
                Altitude lissée par la brume au centre :{' '}
                <strong>{smoothedCenterValue} / 255</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
