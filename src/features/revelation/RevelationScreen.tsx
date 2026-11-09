import React, { useState, useEffect, useMemo } from 'react';
import PixelGrid from '@/components/PixelGrid';
import { generateTerrain } from '@/core/terrain';
import { convolve2d } from '@/core/convolve2d';
import { boxBlur, sharpen } from '@/core/kernels';
import { slopeMap } from '@/core/slope';

interface RevelationScreenProps {
  onRestart: () => void;
  onOpenNotebook: () => void;
}

const DEMO_SIZE = 14;
const REAL_IMAGE_TERRAIN = generateTerrain('massif', 42, DEMO_SIZE);

const BLUR_RESULT = convolve2d(REAL_IMAGE_TERRAIN, boxBlur, { borderMode: 'clamp' });
const SHARP_RESULT = convolve2d(REAL_IMAGE_TERRAIN, sharpen, { borderMode: 'clamp' });
const CONTOURS_RESULT = slopeMap(REAL_IMAGE_TERRAIN, 'clamp');

type FilterEffect = 'blur' | 'contours' | 'sharp';

interface KernelPresetInfo {
  id: FilterEffect;
  name: string;
  seasonOrigin: string;
  matrix: number[];
  divisor: number;
  explanation: string;
}

const KERNEL_PRESETS: Record<FilterEffect, KernelPresetInfo> = {
  blur: {
    id: 'blur',
    name: 'Noyau Flou (Brouillard)',
    seasonOrigin: '❄️ Hiver',
    matrix: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    divisor: 9,
    explanation:
      'Chaque case prend un poids de 1. On somme les 9 cases et on divise par 9 : c’est la moyenne pure qui gomme les bosses !',
  },
  contours: {
    id: 'contours',
    name: 'Noyau Sobel (Arêtes)',
    seasonOrigin: '🍂 Automne',
    matrix: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
    divisor: 1,
    explanation:
      'Les coefficients négatifs à gauche et positifs à droite annulent le plat (0) et font jaillir les falaises verticales !',
  },
  sharp: {
    id: 'sharp',
    name: 'Noyau Rehaussement (Zénith)',
    seasonOrigin: '☀️ Été',
    matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    divisor: 1,
    explanation:
      'Le centre est boosté à 5 pendant que les 4 voisins sont soustraits : la netteté et le contraste éclatent !',
  },
};

/**
 * La Révélation Finale — TrailVision.
 * Unveils the secret behind the 4 seasons: image processing and 2D convolution.
 * Features an epic cinematic sequence, the interactive "Caméléon 3×3", live canvas demo, and sharing CTA.
 */
export default function RevelationScreen({
  onRestart,
}: RevelationScreenProps): React.JSX.Element {
  const [activeEffect, setActiveEffect] = useState<FilterEffect>('blur');
  const [binocularsPos, setBinocularsPos] = useState<{ x: number; y: number }>({
    x: 3,
    y: 3,
  });
  const [copied, setCopied] = useState(false);

  // Automatic gentle sweep of the 3x3 binoculars window across the image
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = setInterval(() => {
      setBinocularsPos((prev) => {
        let nx = prev.x + 1;
        let ny = prev.y;
        if (nx >= DEMO_SIZE - 2) {
          nx = 2;
          ny = prev.y + 1;
          if (ny >= DEMO_SIZE - 2) {
            ny = 2;
          }
        }
        return { x: nx, y: ny };
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  const activeGrid = useMemo(() => {
    if (activeEffect === 'blur') return BLUR_RESULT;
    if (activeEffect === 'contours') return CONTOURS_RESULT;
    if (activeEffect === 'sharp') return SHARP_RESULT;
    return REAL_IMAGE_TERRAIN;
  }, [activeEffect]);

  const activePresetInfo = KERNEL_PRESETS[activeEffect];

  const handleShare = () => {
    const text =
      "🏔️ J'ai accompli l'expédition TrailVision à travers les 4 saisons et percé le secret de la convolution en haute montagne ! Teste toi aussi : https://trailkernel.vercel.app/";

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cinematic Reveal Header */}
      <div className="rounded-3xl bg-gradient-to-b from-[#111827] via-[#1e1b4b] to-[#0f172a] text-white p-6 sm:p-10 border-2 border-[#4f46e5] shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 tracking-wider uppercase">
            ⚡ L'Apothéose de l'Expédition
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Tu croyais simplement randonner...
          </h2>

          <p className="text-sm sm:text-base text-indigo-200 leading-relaxed font-medium">
            Pendant que tu arpentais les 4 saisons, tes yeux de montagnard ont manipulé
            sans le savoir les 4 étapes fondamentales de la{' '}
            <strong>vision par ordinateur</strong> :
          </p>

          {/* 4 Revealed Secrets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-pink-300 flex items-center gap-1.5">
                <span>🌸</span>
                <span>1. Printemps : La fenêtre glissante</span>
              </span>
              <p className="text-stone-300">
                La loupe 3×3 qui glissait sur l'alpage est la{' '}
                <strong>fenêtre locale de voisinage</strong> (le noyau matriciel).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>☀️</span>
                <span>2. Été : La matrice des pixels</span>
              </span>
              <p className="text-stone-300">
                L'altitude et le soleil ne sont rien d'autre que les{' '}
                <strong>valeurs numériques d'une image</strong> de 0 à 255 !
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <span>❄️</span>
                <span>3. Hiver : Le lissage par moyenne</span>
              </span>
              <p className="text-stone-300">
                Moyenner chaque case avec ses 8 voisins pour raboter les pics rocheux,
                c'est le <strong>flou de boîte et gaussien</strong> !
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-orange-300 flex items-center gap-1.5">
                <span>🍂</span>
                <span>4. Automne : La détection de gradient</span>
              </span>
              <p className="text-stone-300">
                Soustraire la gauche de la droite pour allumer les falaises, c'est le
                filtre de détection de contours de <strong>Sobel</strong> !
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-400/50 text-center text-xs sm:text-sm font-bold text-indigo-100 shadow-lg">
            ✨ C'est exactement cette opération mathématique universelle qui s'appelle la{' '}
            <strong>CONVOLUTION 2D</strong> !
          </div>
        </div>
      </div>

      {/* NEW: Le Caméléon 3x3 (La Matrice Vivante) */}
      <div className="rounded-3xl border-2 border-indigo-400 bg-white p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100">
          <div>
            <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
              <span>🦎</span>
              <span>L'Expérience Clé : Le « Caméléon 3×3 »</span>
            </h3>
            <p className="text-xs text-stone-600 font-medium">
              Regardez comment une seule matrice de 9 chiffres produit TOUS les effets
              selon ce qu'on y écrit :
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(KERNEL_PRESETS) as FilterEffect[]).map((key) => {
              const info = KERNEL_PRESETS[key];
              const isSelected = activeEffect === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveEffect(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-200'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {info.name} ({info.seasonOrigin})
                </button>
              );
            })}
          </div>
        </div>

        {/* Matrix Visualization */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-3">
          {/* 3x3 Grid Display */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
              Les 9 coefficients du noyau
            </span>
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-indigo-50 border-2 border-indigo-200 shadow-inner">
              {activePresetInfo.matrix.map((val, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-sm shadow-xs border transition-all ${
                    val > 0
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : val < 0
                        ? 'bg-rose-600 text-white border-rose-700'
                        : 'bg-white text-stone-400 border-stone-200'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </div>
              ))}
            </div>
            {activePresetInfo.divisor > 1 && (
              <span className="mt-2 text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-3 py-0.5 rounded-full">
                Diviseur = ÷{activePresetInfo.divisor}
              </span>
            )}
          </div>

          {/* Explanation Callout */}
          <div className="max-w-md p-4 rounded-2xl bg-[#faf6ee] border border-[#e6d8bf] space-y-2 text-xs leading-relaxed text-stone-700">
            <span className="font-black text-indigo-900 block text-sm">
              {activePresetInfo.name} ({activePresetInfo.seasonOrigin})
            </span>
            <p className="font-medium">{activePresetInfo.explanation}</p>
            <div className="p-2.5 rounded-xl bg-white border border-stone-200 font-mono text-[11px] text-stone-800">
              👉 Multiplier chaque case $\rightarrow$ Sommer les 9 résultats $\rightarrow$
              Diviser.
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Canvas Studio */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-black text-stone-900 tracking-tight">
            Le Studio Réel de Convolution en Direct
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            Les jumelles 3×3 balaient l'image réelle et appliquent le noyau caméléon en
            temps réel :
          </p>
        </div>

        {/* Canvases View: Original Source vs Convolved Result */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-stone-600">
              Paysage Source (Jumelles 3×3 en mouvement)
            </span>
            <div className="map-wood-frame rounded-2xl p-2 bg-[#fdfaf3]">
              <PixelGrid
                grid={REAL_IMAGE_TERRAIN}
                cellSize={24}
                showNumbers={false}
                showGrid={true}
                useTopo={true}
                highlightWindow={binocularsPos}
                allowColorToggle={false}
                ariaLabel="Image source avec balayage 3x3"
              />
            </div>
            <span className="text-[11px] text-stone-500 font-mono">
              Position loupe : (x: {binocularsPos.x}, y: {binocularsPos.y})
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-stone-600">
              Résultat Calculé par le Noyau Sélectionné
            </span>
            <div className="map-wood-frame rounded-2xl p-2 bg-[#fdfaf3]">
              <PixelGrid
                grid={activeGrid}
                cellSize={24}
                showNumbers={false}
                showGrid={true}
                colorMode={activeEffect === 'contours' ? 'slopeDifficulty' : 'topo'}
                allowColorToggle={false}
                ariaLabel="Résultat filtré de la convolution"
              />
            </div>
            <span className="text-[11px] text-stone-500 font-mono">
              Effet : {activePresetInfo.name}
            </span>
          </div>
        </div>

        {/* Action Buttons: EXPLORE AGAIN & SHARE YOUR DISCOVERY */}
        <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onRestart}
            className="px-6 py-3 rounded-2xl font-black text-xs sm:text-sm bg-stone-800 hover:bg-stone-900 text-white transition-all cursor-pointer shadow-md flex items-center gap-2 transform active:scale-95"
          >
            <span>🔄</span>
            <span>EXPLORE AGAIN (Recommencer l'expédition)</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-7 py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-orange-600 to-indigo-600 hover:from-orange-500 hover:to-indigo-500 text-white transition-all cursor-pointer shadow-lg flex items-center gap-2 transform active:scale-95"
          >
            <span>✨</span>
            <span>
              {copied ? '✓ Lien copié dans le presse-papier !' : 'SHARE YOUR DISCOVERY'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
