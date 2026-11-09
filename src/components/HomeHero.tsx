import React, { useState, useEffect } from 'react';
import PixelGrid from '@/components/PixelGrid';
import { generateTerrain } from '@/core/terrain';
import TrailBot from '@/components/TrailBot';
import {
  type SeasonId,
  type TrailVisionProgress,
  isRevelationUnlocked,
} from '@/core/storage';

interface HomeHeroProps {
  progress: TrailVisionProgress;
  onSelectSeason: (season: SeasonId) => void;
  onSelectRevelation: () => void;
  onOpenNotebook: () => void;
}

const DEMO_SIZE = 10;
const DEMO_GRID = generateTerrain('massif', 99, DEMO_SIZE);

const SEASONS: Array<{
  id: SeasonId;
  name: string;
  theme: string;
  desc: string;
  icon: string;
}> = [
  {
    id: 'spring',
    name: '1. Printemps',
    theme: 'Alpage & Loupe de Scan',
    desc: 'Balaie l’herbe à la loupe pour trouver les fleurs rares.',
    icon: '🌸',
  },
  {
    id: 'summer',
    name: '2. Été',
    theme: 'Zénith & Échelle 0–255',
    desc: 'Mesure la luminosité du relief sous la course du soleil.',
    icon: '☀️',
  },
  {
    id: 'autumn',
    name: '3. Automne',
    theme: 'Carte Topo & Lignes de Crêtes',
    desc: 'Détecte les à-pics et balise le sentier d’arête vertigineux.',
    icon: '🍂',
  },
  {
    id: 'winter',
    name: '4. Hiver',
    theme: 'Grand Brouillard & 8 Voisins',
    desc: 'Observe comment la brume fusionne et lisse chaque point.',
    icon: '❄️',
  },
];

/**
 * Camp de Base — Landing Page for TrailVision.
 * Genuine mountain immersion, live 3×3 scanner demo, and 4 season expedition checkpoints.
 */
export default function HomeHero({
  progress,
  onSelectSeason,
  onSelectRevelation,
  onOpenNotebook,
}: HomeHeroProps): React.JSX.Element {
  const [scannerPos, setScannerPos] = useState<{ x: number; y: number }>({ x: 2, y: 2 });

  // Animated sweep across the demo grid
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = setInterval(() => {
      setScannerPos((prev) => {
        let nx = prev.x + 1;
        let ny = prev.y;
        if (nx >= DEMO_SIZE - 1) {
          nx = 1;
          ny = prev.y + 1;
          if (ny >= DEMO_SIZE - 1) {
            ny = 1;
          }
        }
        return { x: nx, y: ny };
      });
    }, 700);

    return () => clearInterval(timer);
  }, []);

  const revelationReady = isRevelationUnlocked(progress);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-b from-[#1c1917] to-[#2b241c] text-stone-100 p-6 sm:p-10 shadow-xl border-2 border-[#5a3215] overflow-hidden relative">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-600/30 text-orange-300 border border-orange-500/40">
            <span>🥾</span>
            <span>Expédition Alpine Interactive</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            TrailVision
          </h2>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-medium">
            Arpentez <strong>4 saisons en haute montagne</strong> à travers la carte topo,
            l'altimètre et les jumelles. Chaque saison recèle un secret... Saurez-vous
            tous les percer pour atteindre la Révélation ?
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSelectSeason(progress.activeSeason || 'spring')}
              className="px-6 py-3 rounded-xl font-black text-sm bg-orange-600 hover:bg-orange-500 text-white shadow-lg transition-all cursor-pointer flex items-center gap-2 transform active:scale-95"
            >
              <span>⛰️</span>
              <span>
                {progress.completedSeasons.length > 0
                  ? "Continuer l'Expédition"
                  : "Démarrer l'Expédition (Printemps)"}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenNotebook}
              className="px-5 py-3 rounded-xl font-bold text-sm bg-[#3a2c20] hover:bg-[#4d3a2b] text-stone-200 border border-[#6b4b32] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>📓</span>
              <span>Carnet d'expédition</span>
            </button>
          </div>
        </div>

        {/* Decorative background mountain ridge */}
        <div
          className="absolute -right-8 -bottom-12 opacity-15 pointer-events-none select-none text-[180px] font-mono leading-none text-white"
          aria-hidden="true"
        >
          ▲
        </div>
      </div>

      {/* 4 Seasons Checkpoints Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-stone-700">
          Les 4 Saisons de l'Expédition
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SEASONS.map((season) => {
            const isCompleted = progress.completedSeasons.includes(season.id);

            return (
              <div
                key={season.id}
                onClick={() => onSelectSeason(season.id)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between h-48 shadow-sm hover:scale-102 ${
                  isCompleted
                    ? 'bg-white border-[#86efac] shadow-xs'
                    : 'bg-[#faf6ee] border-[#dfcfb0] hover:border-orange-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{season.icon}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isCompleted ? '✓ Badge Obtenu' : 'À explorer'}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-stone-900">{season.name}</h4>
                  <p className="text-[11px] font-bold text-orange-700">{season.theme}</p>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {season.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-orange-700">
                  <span>Rejoindre le sentier →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revelation Teaser Card */}
      <div
        onClick={() => revelationReady && onSelectRevelation()}
        className={`p-6 rounded-3xl border-2 transition-all ${
          revelationReady
            ? 'bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white border-indigo-400 shadow-xl cursor-pointer hover:scale-101'
            : 'bg-stone-200/80 border-stone-300 text-stone-500 cursor-not-allowed opacity-80'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{revelationReady ? '⚡' : '🔒'}</span>
            <div>
              <h4 className="text-lg font-black tracking-tight">
                {revelationReady
                  ? '⚡ La Révélation est Accessible !'
                  : '🔒 La Révélation (Verrouillée)'}
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                {revelationReady
                  ? 'Félicitations ! Vous avez accompli les 4 saisons. Cliquez ici pour franchir le seuil et découvrir le secret de la vision alpine.'
                  : 'Accomplissez les 4 saisons montagnardes pour débloquer l’apothéose finale et la démonstration interactive en direct.'}
              </p>
            </div>
          </div>

          {revelationReady && (
            <button
              type="button"
              onClick={onSelectRevelation}
              className="px-6 py-2.5 rounded-xl font-black text-xs bg-indigo-500 hover:bg-indigo-400 text-white shadow-md cursor-pointer shrink-0"
            >
              Découvrir la Révélation →
            </button>
          )}
        </div>
      </div>

      {/* Live Animated 3x3 Window Scanning Demo */}
      <div className="rounded-3xl border border-[#ded0b4] bg-white p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-3">
          <span className="inline-block text-xs font-black uppercase tracking-wider text-orange-800 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
            Jumelles d'observation 3×3
          </span>
          <h3 className="text-2xl font-black text-stone-900 tracking-tight">
            Le balayage du massif pas à pas
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
            À chaque pas, le randonneur examine sa position et les 8 rochers qui
            l'entourent. Ce simple balayage régulier est la clé de toute l'expédition !
          </p>
          <div className="text-xs text-stone-700 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/90 font-mono">
            Position des jumelles : (x: {scannerPos.x}, y: {scannerPos.y}) | Champ exploré
            : 9 cases
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="map-wood-frame rounded-2xl p-2 bg-[#fdfaf3]">
            <PixelGrid
              grid={DEMO_GRID}
              cellSize={26}
              showNumbers={false}
              showGrid={true}
              useTopo={true}
              allowColorToggle={false}
              highlightWindow={scannerPos}
              ariaLabel="Démonstration animée des jumelles balayant la carte"
            />
          </div>
        </div>
      </div>

      {/* Real Statistics */}
      <div className="rounded-3xl border border-[#ded0b4] bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-stone-600">
          Carnet de Rando — Statistiques Réelles
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#e5d8c1] space-y-1">
            <span className="text-xs text-stone-600 font-semibold">Dénivelé positif</span>
            <div className="text-2xl font-black text-stone-900 font-mono">
              {progress.elevationGainMeters} m D+
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#e5d8c1] space-y-1">
            <span className="text-xs text-stone-600 font-semibold">
              Saisons accomplies
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {progress.completedSeasons.length} / 4
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#e5d8c1] space-y-1">
            <span className="text-xs text-stone-600 font-semibold">
              Statut de la Révélation
            </span>
            <div className="text-sm font-black text-indigo-700 pt-1">
              {revelationReady ? '⚡ Prête à être dévoilée' : '🔒 4 saisons requises'}
            </div>
          </div>
        </div>
      </div>

      <TrailBot season="spring" />
    </div>
  );
}
