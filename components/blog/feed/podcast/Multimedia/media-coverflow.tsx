"use client";

import type { MediaCard } from "@/types/multimedia";
import { MediaCoverCard } from "./media-cover-card";

interface ActiveVideoBinding {
  mediaRef: React.RefObject<HTMLMediaElement | null>;
  muted: boolean;
  mediaElementProps: {
    onTimeUpdate: () => void;
    onDurationChange: () => void;
    onEnded: () => void;
  };
}

interface MediaCoverflowProps {
  cards: MediaCard[];
  activeIndex: number;
  isPlaying: boolean;
  onSelect: (index: number) => void;
  activeVideoBinding?: ActiveVideoBinding;
  /** Nombre de cartes visibles de chaque côté de la carte active. */
  visibleRange?: number;
}

/**
 * Pile de cartes en 3D : toutes les cartes sont ancrées au même point
 * central (via le wrapper "absolute left-1/2 top-1/2 -translate-1/2"),
 * puis chaque MediaCoverCard se décale/incline/rétrécit lui-même selon
 * sa distance à la carte active (offset). Tout est piloté par l'index
 * actif — c'est ce chevauchement centré qui donne l'effet coverflow,
 * pas un simple scroll horizontal de cartes côte à côte.
 */
export function MediaCoverflow({
  cards,
  activeIndex,
  isPlaying,
  onSelect,
  activeVideoBinding,
  visibleRange = 2,
}: MediaCoverflowProps) {
  return (
    <div
      className="relative w-full h-48 sm:h-60 md:h-72"
      style={{ perspective: "1200px" }}
    >
      {cards.map((card, index) => {
        const offset = index - activeIndex;
        if (Math.abs(offset) > visibleRange) return null;

        return (
          <div
            key={card.id}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <MediaCoverCard
              card={card}
              offset={offset}
              isActive={offset === 0}
              isPlaying={isPlaying}
              onSelect={() => onSelect(index)}
              activeVideoBinding={
                card.kind === "video" && offset === 0 ? activeVideoBinding : undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
}
