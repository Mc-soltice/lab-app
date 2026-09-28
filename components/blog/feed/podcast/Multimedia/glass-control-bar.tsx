"use client";

import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import type { MediaCard } from "@/types/multimedia";

interface GlassControlBarProps {
  card: MediaCard | undefined;
  isPlaying: boolean;
  isMuted: boolean;
  progressPercent: number;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
}

export function GlassControlBar({
  card,
  isPlaying,
  isMuted,
  progressPercent,
  onPrev,
  onNext,
  onTogglePlay,
  onToggleMute,
}: GlassControlBarProps) {
  const thumbnailUrl = card?.kind === "podcast" ? card.coverUrl : undefined;

  return (
    <div className="mx-auto w-full max-w-md flex items-center gap-2 sm:gap-3 rounded-full border border-white/15 bg-white/10 backdrop-blur-2xl px-2.5 sm:px-3 py-2 sm:py-2.5 shadow-2xl">
      <button
        type="button"
        onClick={onPrev}
        className="text-white/80 hover:text-white transition-colors p-1"
        aria-label="Précédent"
      >
        <SkipBack className="w-4 h-4 fill-current" />
      </button>
      <button
        type="button"
        onClick={onTogglePlay}
        className="text-white/90 hover:text-white transition-colors p-1"
        aria-label={isPlaying ? "Mettre en pause" : "Lire"}
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
      </button>
      <button
        type="button"
        onClick={onNext}
        className="text-white/80 hover:text-white transition-colors p-1"
        aria-label="Suivant"
      >
        <SkipForward className="w-4 h-4 fill-current" />
      </button>

      <div className="flex items-center gap-2 min-w-0 flex-1 pl-1">
        {thumbnailUrl && (
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-md overflow-hidden shrink-0 border border-white/10">
            <ProductImage src={thumbnailUrl} alt="" fill sizes="32px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-white text-[10px] sm:text-xs font-semibold truncate leading-tight">{card?.title}</p>
          <p className="text-white/60 text-[8px] sm:text-[10px] truncate leading-tight">{card?.subtitle}</p>
          <div className="mt-1 h-[2px] w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleMute}
        className="text-white/80 hover:text-white transition-colors p-1 shrink-0"
        aria-label={isMuted ? "Activer le son" : "Couper le son"}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
