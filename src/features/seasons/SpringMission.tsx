import React, { useState, useMemo, useCallback } from 'react';
import PixelGrid from '@/components/PixelGrid';
import { generateTerrain } from '@/core/terrain';
import TrailBot from '@/components/TrailBot';

interface SpringMissionProps {
  onComplete: () => void;
  isCompleted: boolean;
}

const MEADOW_SIZE = 14;
const MEADOW_SEED = 108;
const MEADOW_GRID = generateTerrain('massif', MEADOW_SEED, MEADOW_SIZE);

interface HiddenFlower {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  found: boolean;
  hint: string;
}

const INITIAL_FLOWERS: HiddenFlower[] = [
  {
    id: 'edelweiss',
    name: 'Edelweiss argenté',
    icon: '🌼',
    x: 4,
    y: 3,
    found: false,
    hint: 'Pousse sur les replats herbeux d’altitude moyenne (vers le nord-ouest).',
  },
  {
    id: 'gentiane',
    name: 'Gentiane acaule bleue',
    icon: '🌺',
    x: 9,
    y: 5,
    found: false,
    hint: 'Aime la lumière vive de l’alpage central (vers l’est).',
  },
  {
    id: 'arnica',
    name: 'Arnica dorée des crêtes',
    icon: '🌻',
    x: 6,
    y: 10,
    found: false,
    hint: 'Fleurit près du torrent en contrebas (vers le sud).',
  },
];

/**
 * Mission Printemps : "L'Éveil des Alpages".
 * Interactive 3×3 observation magnifying loupe scanning the meadow to locate hidden alpine flora.
 * Teaches 3×3 local neighborhood scanning without any technical jargon.
 */
export default function SpringMission({
  onComplete,
  isCompleted,
}: SpringMissionProps): React.JSX.Element {
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({ x: 4, y: 3 });
  const [flowers, setFlowers] = useState<HiddenFlower[]>(INITIAL_FLOWERS);
  const [exploredCells, setExploredCells] = useState<Set<number>>(new Set());

  // Check if current loupe position reveals any flower (within the 3x3 window: dx <= 1 && dy <= 1)
  const handleInspect = useCallback(
    (x: number, y: number) => {
      setLoupePos({ x, y });

      // Add central and neighbouring cells to explored set
      setExploredCells((prev) => {
        const next = new Set(prev);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < MEADOW_SIZE && ny >= 0 && ny < MEADOW_SIZE) {
              next.add(ny * MEADOW_SIZE + nx);
            }
          }
        }
        return next;
      });

      // Check for flower discovery in window
      setFlowers((prev) => {
        let newlyFound = false;
        const updated = prev.map((f) => {
          if (!f.found && Math.abs(f.x - x) <= 1 && Math.abs(f.y - y) <= 1) {
            newlyFound = true;
            return { ...f, found: true };
          }
          return f;
        });

        if (newlyFound && updated.every((f) => f.found)) {
          onComplete();
        }
        return updated;
      });
    },
    [onComplete],
  );

  const foundCount = useMemo(() => flowers.filter((f) => f.found).length, [flowers]);

  return (
    <div className="space-y-6">
      {/* Seasonal Mission Banner */}
      <div className="p-4 rounded-2xl bg-[#f4faf2] border-2 border-[#bbf7d0] text-stone-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Fleur">
              🌸
            </span>
            <h3 className="text-base font-black text-[#15803d]">
              Mission Printemps — La Loupe Botanique
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] border border-[#86efac]">
            {isCompleted ? '✓ Badge Printemps Obtenu' : 'Badge en jeu : 🌸 Bourgeon'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          Le printemps fait renaître la flore alpine ! Déplacez votre{' '}
          <strong>loupe de repérage carrée</strong> sur l'alpage pour examiner chaque
          mètre carré d'herbe et débusquer les 3 fleurs protégées.
        </p>
      </div>

      <TrailBot season="spring" />

      {/* Main 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Spring Meadow Map with Loupe */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[420px] map-wood-frame rounded-2xl p-2 bg-[#fdfaf3]">
            <PixelGrid
              grid={MEADOW_GRID}
              cellSize={25}
              showNumbers={false}
              showGrid={true}
              useTopo={true}
              highlightWindow={loupePos}
              highlightedCells={exploredCells}
              onCellClick={handleInspect}
              ariaLabel="Prairie printanière d'altitude"
            />
          </div>
          <p className="text-[11px] text-stone-500 mt-2 text-center italic">
            Cliquez n'importe où sur l'alpage pour y poser votre loupe de repérage 3×3.
          </p>
        </div>

        {/* Right Column: Loupe Inspector & Flora Checklist */}
        <div className="lg:col-span-5 space-y-4">
          {/* Loupe Viewfinder Card */}
          <div className="wood-board-panel p-4 text-white rounded-2xl relative shadow-md">
            <span className="screw-rivet-gold absolute top-2.5 left-2.5" />
            <span className="screw-rivet-gold absolute top-2.5 right-2.5" />
            <span className="screw-rivet-gold absolute bottom-2.5 left-2.5" />
            <span className="screw-rivet-gold absolute bottom-2.5 right-2.5" />

            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#a86e3f]/60">
              <span className="text-xs font-black uppercase tracking-wider text-amber-200">
                🔍 Loupe d'observation (Position : {loupePos.x}, {loupePos.y})
              </span>
              <span className="text-xs font-bold text-amber-300">Fenêtre : 9 cases</span>
            </div>

            <div className="parchment-box rounded-xl p-3 text-stone-900 space-y-2">
              <p className="text-xs text-stone-600 font-medium">
                Sous la loupe, vous observez la case centrale et ses{' '}
                <strong>8 brins d'herbe voisins</strong> immédiats.
              </p>
              <div className="text-center py-2 px-3 bg-[#e8f5e9] rounded-lg border border-[#c8e6c9] text-xs font-bold text-[#1b5e20]">
                {flowers.some(
                  (f) =>
                    f.found &&
                    Math.abs(f.x - loupePos.x) <= 1 &&
                    Math.abs(f.y - loupePos.y) <= 1,
                )
                  ? '✨ Espèce rare sous les yeux !'
                  : '🌱 Herbe d’alpage et mousses sauvages'}
              </div>
            </div>
          </div>

          {/* Flora Checklist */}
          <div className="rounded-2xl border-2 border-[#bbf7d0] bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#15803d]">
                Herbier du printemps ({foundCount} / {flowers.length} trouvées)
              </h4>
              <span className="text-xs font-mono font-bold text-stone-500">
                {Math.round((foundCount / flowers.length) * 100)}%
              </span>
            </div>

            <div className="space-y-2">
              {flowers.map((flower) => (
                <div
                  key={flower.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                    flower.found
                      ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                      : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{flower.icon}</span>
                    <div>
                      <span className="font-bold block">{flower.name}</span>
                      <span className="text-[10px] text-stone-400 block">
                        {flower.found ? 'Localisée avec succès !' : flower.hint}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded-full ${
                      flower.found
                        ? 'bg-[#10b981] text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {flower.found ? '✓ Trouvée' : 'À chercher'}
                  </span>
                </div>
              ))}
            </div>

            {foundCount === flowers.length && (
              <div className="p-3 rounded-xl bg-[#dcfce7] border border-[#86efac] text-[#166534] text-xs font-bold text-center">
                🎉 Bravo ! Vous avez débusqué les 3 joyaux de l'alpage avec votre loupe !
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
