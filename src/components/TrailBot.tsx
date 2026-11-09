import React, { useState } from 'react';
import type { SeasonId } from '@/core/storage';

interface TrailBotProps {
  season?: SeasonId | 'revelation';
  customMessage?: string;
  className?: string;
}

const SEASONAL_TIPS: Record<
  SeasonId | 'revelation',
  { title: string; quotes: string[] }
> = {
  spring: {
    title: 'TrailBot en alpage fleuri 🌸',
    quotes: [
      '« Sors ta loupe de repérage ! La gentiane bleue et l’edelweiss se cachent dans les recoins les plus touffus ! »',
      '« Une loupe qui balaie le sol mètre par mètre, c’est le secret de tout bon garde-parc ! »',
      '« Observe bien autour de toi : chaque herbe a ses voisins immédiats ! »',
    ],
  },
  summer: {
    title: 'TrailBot sous le cagnard ☀️',
    quotes: [
      '« N’oublie pas ta gourde ! À midi pile, le soleil écrase le relief : 255 sur la neige étincelante, 0 dans la gorge sombre ! »',
      '« Chaque case de la montagne possède sa propre cote de clarté entre 0 et 255. Rien n’est laissé au hasard ! »',
      '« Fais glisser l’heure du jour pour voir l’ombre s’allonger sur les crêtes rocheuses ! »',
    ],
  },
  autumn: {
    title: 'TrailBot sur le fil de l’arête 🍂',
    quotes: [
      '« Gare au faux pas ! Dès que la pente devient abrupte, le contraste explose et trace le contour de la falaise ! »',
      '« Sur la carte topo, les lignes serrées signalent le précipice. Ouvre l’œil pour baliser le sentier d’arête ! »',
      '« Comparer la gauche et la droite, le nord et le sud : voilà comment on détecte les parois verticales ! »',
    ],
  },
  winter: {
    title: 'TrailBot dans le blizzard ❄️',
    quotes: [
      '« Brrr ! Le grand brouillard givrant est tombé ! Quand la visibilité baisse, chaque point se mélange doucement avec ses 8 voisins. »',
      '« Plus le brouillard est dense, plus les aspérités de la roche s’estompent en un doux manteau blanc. »',
      '« Regarde le schéma de proximité : le marcheur au centre prend la moyenne des 8 points qui l’entourent ! »',
    ],
  },
  revelation: {
    title: 'TrailBot face au Grand Panorama ⚡',
    quotes: [
      '« Tu pensais faire une simple rando ? Assieds-toi au refuge... Ce que tes yeux ont fait s’appelle la CONVOLUTION ! »',
      '« La loupe, les 8 voisins, le brouillard, les crêtes... Tout était lié depuis le premier pas ! »',
    ],
  },
};

/**
 * TrailBot — The witty and cheerful alpine guide companion.
 * Displays interactive contextual guidance for each season, minimizable anytime.
 */
export default function TrailBot({
  season = 'spring',
  customMessage,
  className = '',
}: TrailBotProps): React.JSX.Element {
  const [minimized, setMinimized] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const tips = SEASONAL_TIPS[season];
  const currentQuote = customMessage ?? tips.quotes[quoteIndex % tips.quotes.length];

  const handleNextQuote = () => {
    if (!customMessage) {
      setQuoteIndex((prev) => (prev + 1) % tips.quotes.length);
    }
  };

  if (minimized) {
    return (
      <aside aria-label="Compagnon TrailBot" className={`inline-block ${className}`}>
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3d2716] hover:bg-[#52351e] text-amber-200 border border-[#7a4c28] shadow-md transition-all cursor-pointer text-xs font-bold"
          title="Faire parler TrailBot"
        >
          <span className="text-base" role="img" aria-label="Robot Guide">
            🤖
          </span>
          <span>Conseil de TrailBot</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Compagnon TrailBot"
      className={`relative flex items-start gap-3 p-3.5 rounded-2xl bg-[#fff9ee] border-2 border-[#d9ba88] shadow-sm text-stone-800 ${className}`}
    >
      {/* TrailBot Avatar */}
      <div className="shrink-0 flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#4b3523] to-[#342214] p-1 border-2 border-[#82542e] shadow-md flex items-center justify-center text-white relative group cursor-pointer"
          onClick={handleNextQuote}
          title="Cliquez pour un autre conseil montagnard"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleNextQuote();
          }}
        >
          {/* Alpine Bot SVG Graphic */}
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Robot Head */}
            <rect
              x="25"
              y="32"
              width="50"
              height="42"
              rx="10"
              fill="#cbd5e1"
              stroke="#475569"
              strokeWidth="3"
            />
            {/* Green Alpine Felt Hat */}
            <path d="M20 32 C25 15, 75 15, 80 32 Z" fill="#15803d" />
            <rect x="16" y="30" width="68" height="6" rx="2" fill="#166534" />
            {/* Little Edelweiss feather on hat */}
            <circle cx="70" cy="22" r="3" fill="#ea580c" />
            {/* Glowing Eyes */}
            <circle cx="40" cy="50" r="5" fill="#0284c7" />
            <circle cx="60" cy="50" r="5" fill="#0284c7" />
            {/* Digital Smile */}
            <path
              d="M40 64 Q 50 72 60 64"
              stroke="#0f172a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Antenna with LED bulb */}
            <line x1="50" y1="15" x2="50" y2="4" stroke="#64748b" strokeWidth="3" />
            <circle cx="50" cy="4" r="3" fill="#f59e0b" />
          </svg>
          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-950 font-black text-[9px] px-1 rounded-full">
            BOT
          </span>
        </div>
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-black text-xs uppercase tracking-wider text-[#8b4f24]">
            {tips.title}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-stone-700 italic font-medium">
          {currentQuote}
        </p>
      </div>

      {/* Minimize button */}
      <button
        type="button"
        onClick={() => setMinimized(true)}
        className="absolute top-2.5 right-2.5 text-stone-400 hover:text-stone-700 text-xs p-1 rounded cursor-pointer"
        title="Masquer TrailBot"
        aria-label="Masquer la bulle de TrailBot"
      >
        ✕
      </button>
    </aside>
  );
}
