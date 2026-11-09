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

type FilterEffect = 'original' | 'blur' | 'contours' | 'sharp';

/**
 * La Révélation Finale — TrailVision.
 * Unveils the secret behind the 4 seasons: image processing and 2D convolution.
 * Features an epic cinematic sequence, live sliding 3×3 binoculars canvas demo, and sharing CTA.
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
        {/* Subtle decorative background glow */}
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
            sans le savoir les piliers absolus de la{' '}
            <strong>vision par ordinateur</strong> :
          </p>

          {/* 4 Revealed Secrets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-pink-300 flex items-center gap-1.5">
                <span>🌸</span>
                <span>Printemps : La loupe de repérage</span>
              </span>
              <p className="text-stone-300">
                La loupe 3×3 qui glissait sur l'herbe est la{' '}
                <strong>fenêtre glissante</strong> (le noyau matriciel).
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>☀️</span>
                <span>Été : La clarté 0 à 255</span>
              </span>
              <p className="text-stone-300">
                L'altitude et le soleil ne sont rien d'autre que les{' '}
                <strong>valeurs numériques d'une image</strong> en niveaux de gris !
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-orange-300 flex items-center gap-1.5">
                <span>🍂</span>
                <span>Automne : Les arêtes de falaise</span>
              </span>
              <p className="text-stone-300">
                Détecter les cassures de pente brutales, c'est le filtre de contours de{' '}
                <strong>Sobel</strong> !
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <span>❄️</span>
                <span>Hiver : Le brouillard lissant</span>
              </span>
              <p className="text-stone-300">
                Moyenner chaque case avec ses 8 voisins, c'est le{' '}
                <strong>lissage et le flou gaussien</strong> !
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-400/40 text-center text-xs font-bold text-indigo-100">
            ✨ C'est exactement cette opération mathématique qui s'appelle la{' '}
            <strong>CONVOLUTION 2D</strong> !
          </div>
        </div>
      </div>

      {/* Live Interactive Canvas Binoculars Studio */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              Le Studio Réel de Convolution en Direct
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Observez les jumelles 3×3 balayer l'image et appliquez les filtres en temps
              réel :
            </p>
          </div>

          {/* Filter Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveEffect('blur')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeEffect === 'blur'
                  ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              🌫️ Brouillard (Lissage /9)
            </button>
            <button
              type="button"
              onClick={() => setActiveEffect('contours')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeEffect === 'contours'
                  ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              📐 Crêtes (Contours de Sobel)
            </button>
            <button
              type="button"
              onClick={() => setActiveEffect('sharp')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeEffect === 'sharp'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              ☀️ Zénith (Rehaussement Net)
            </button>
          </div>
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
              Résultat Calculé par Convolution
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
              Effet : {activeEffect.toUpperCase()}
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
