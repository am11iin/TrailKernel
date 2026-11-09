import React, { useState, useMemo, useCallback } from 'react';
import PixelGrid from '@/components/PixelGrid';
import { generateTerrain } from '@/core/terrain';
import { clampByte, createGrid } from '@/core/grid';
import TrailBot from '@/components/TrailBot';

interface SummerMissionProps {
  onComplete: () => void;
  isCompleted: boolean;
}

const SUMMIT_SIZE = 14;
const BASE_TERRAIN = generateTerrain('massif', 42, SUMMIT_SIZE);

interface SunHour {
  hour: number;
  label: string;
  icon: string;
  factor: number; // multiplier for light reflection
  offset: number; // base ambient light
}

const SUN_PRESETS: SunHour[] = [
  { hour: 7, label: '7h — Aube naissante', icon: '🌅', factor: 0.6, offset: 15 },
  { hour: 12, label: '12h — Zénith éclatant', icon: '☀️', factor: 1.0, offset: 40 },
  { hour: 17, label: '17h — Déclin doré', icon: '🌇', factor: 0.85, offset: 25 },
  { hour: 21, label: '21h — Pénombre nocturne', icon: '🌙', factor: 0.4, offset: 5 },
];

/**
 * Mission Été : "Le Zénith des Cimes".
 * Teaches that relief values and light reflection map to a numerical 0-255 grid.
 * Features an hourly sun slider, color/grayscale toggle, and direct 0-255 altimeter probing.
 */
export default function SummerMission({
  onComplete,
  isCompleted,
}: SummerMissionProps): React.JSX.Element {
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [colorMode, setColorMode] = useState<'topo' | 'grayscale'>('topo');
  const [testedHours, setTestedHours] = useState<Set<number>>(new Set([12]));
  const [probedCells, setProbedCells] = useState<Set<number>>(new Set());
  const [activeCell, setActiveCell] = useState<{
    x: number;
    y: number;
    val: number;
  } | null>(null);

  const currentPreset = useMemo(() => {
    return (
      SUN_PRESETS.find((p) => Math.abs(p.hour - selectedHour) < 2) ?? SUN_PRESETS[1]!
    );
  }, [selectedHour]);

  // Compute terrain illuminated by the current sun hour using core clampByte
  const illuminatedTerrain = useMemo(() => {
    const grid = createGrid(BASE_TERRAIN.width, BASE_TERRAIN.height, 0);
    for (let i = 0; i < BASE_TERRAIN.data.length; i++) {
      const raw =
        (BASE_TERRAIN.data[i] ?? 0) * currentPreset.factor + currentPreset.offset;
      grid.data[i] = clampByte(raw);
    }
    return grid;
  }, [currentPreset]);

  const handleCellClick = useCallback(
    (x: number, y: number, value: number) => {
      setActiveCell({ x, y, val: value });
      setProbedCells((prev) => {
        const next = new Set(prev);
        next.add(y * SUMMIT_SIZE + x);
        if (next.size >= 4 && testedHours.size >= 2) {
          onComplete();
        }
        return next;
      });
    },
    [onComplete, testedHours],
  );

  const handleHourChange = (newHour: number) => {
    setSelectedHour(newHour);
    setTestedHours((prev) => {
      const next = new Set(prev);
      next.add(newHour);
      if (probedCells.size >= 4 && next.size >= 2) {
        onComplete();
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Summer Mission Banner */}
      <div className="p-4 rounded-2xl bg-[#fffbeb] border-2 border-[#fde68a] text-stone-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Soleil">
              ☀️
            </span>
            <h3 className="text-base font-black text-[#b45309]">
              Mission Été — L'Échelle Solaire (0 à 255)
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]">
            {isCompleted ? '✓ Badge Été Obtenu' : 'Badge en jeu : ☀️ Soleil'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          Sous le soleil d'altitude, chaque recoin du massif renvoie une clarté mesurée
          entre <strong>0 (obscurité totale)</strong> et{' '}
          <strong>255 (neige éclatante)</strong>. Faites varier l'heure de la journée et
          sondez au moins 4 points pour calibrer votre altimètre.
        </p>
      </div>

      <TrailBot season="summer" />

      {/* Main 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Illuminated Terrain Map */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-600">Affichage :</span>
              <button
                type="button"
                onClick={() => setColorMode((m) => (m === 'topo' ? 'grayscale' : 'topo'))}
                className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-stone-300 shadow-xs hover:border-orange-400 cursor-pointer flex items-center gap-1.5"
              >
                <span>
                  {colorMode === 'topo'
                    ? '🗺️ Couleurs de montagne'
                    : '⬛ Niveaux de gris (0–255)'}
                </span>
              </button>
            </div>
            <span className="text-xs font-mono font-bold text-stone-500">
              {currentPreset.icon} {currentPreset.label}
            </span>
          </div>

          <div className="w-full max-w-[420px] map-wood-frame rounded-2xl p-2 bg-[#fdfaf3]">
            <PixelGrid
              grid={illuminatedTerrain}
              cellSize={25}
              showNumbers={false}
              showGrid={true}
              colorMode={colorMode}
              allowColorToggle={false}
              highlightedCells={probedCells}
              onCellClick={handleCellClick}
              ariaLabel="Massif rocheux sous l'ensoleillement estival"
            />
          </div>
          <p className="text-[11px] text-stone-500 mt-2 text-center italic">
            Cliquez sur le massif pour mesurer la valeur numérique exacte du point sous ce
            soleil.
          </p>
        </div>

        {/* Right Column: Sun Slider & Solar Altimeter Gauge */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sun Hour Slider Card */}
          <div className="wood-board-panel p-4 text-white rounded-2xl relative shadow-md">
            <span className="screw-rivet-gold absolute top-2.5 left-2.5" />
            <span className="screw-rivet-gold absolute top-2.5 right-2.5" />
            <span className="screw-rivet-gold absolute bottom-2.5 left-2.5" />
            <span className="screw-rivet-gold absolute bottom-2.5 right-2.5" />

            <h4 className="text-xs font-black uppercase tracking-wider text-amber-100 mb-3 text-center">
              Course du Soleil d'Altitude
            </h4>

            <div className="parchment-box rounded-xl p-3 text-stone-900 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Heure sélectionnée :</span>
                <span className="text-orange-700 font-mono text-sm">
                  {selectedHour}h00
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="7"
                max="21"
                step="1"
                value={selectedHour}
                onChange={(e) => handleHourChange(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
                aria-label="Régler l'heure d'ensoleillement"
              />

              <div className="flex justify-between text-[10px] text-stone-500 font-bold">
                <span>🌅 Aube (7h)</span>
                <span>☀️ Zénith (12h)</span>
                <span>🌙 Soir (21h)</span>
              </div>
            </div>
          </div>

          {/* 0-255 Altimeter Probe Display */}
          <div className="metal-bezel-panel rounded-2xl p-4 text-white shadow-md space-y-3">
            <span className="screw-rivet-silver absolute top-2.5 left-2.5" />
            <span className="screw-rivet-silver absolute top-2.5 right-2.5" />

            <div className="flex items-center justify-between border-b border-stone-600 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-200">
                Altimètre / Photomètre (0–255)
              </h4>
              <span className="text-xs font-mono font-bold text-stone-300">
                {probedCells.size} / 4 sondages
              </span>
            </div>

            {activeCell ? (
              <div className="bg-stone-900/90 rounded-xl p-3 border border-stone-700 text-stone-100 font-mono space-y-2">
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Coordonnées :</span>
                  <span>
                    (x: {activeCell.x}, y: {activeCell.y})
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-amber-400">Valeur numérique :</span>
                  <span className="text-2xl font-black text-white">
                    {activeCell.val}{' '}
                    <span className="text-xs font-normal text-stone-400">/ 255</span>
                  </span>
                </div>
                <div className="w-full bg-stone-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-stone-500 via-amber-400 to-white h-full"
                    style={{ width: `${(activeCell.val / 255) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-300 italic text-center py-2">
                Touchez une zone de la carte pour lire sa cote numérique de 0 à 255.
              </p>
            )}

            {probedCells.size >= 4 && testedHours.size >= 2 && (
              <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-500 text-emerald-200 text-xs font-bold text-center">
                🎉 Étalonnage réussi ! Chaque point correspond fidèlement à un nombre de 0
                à 255.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
