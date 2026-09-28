"use client";

import ProductImage from "@/components/ProductImage";
import type { MediaCard } from "@/types/multimedia";
import { Video } from "lucide-react";

interface MediaCoverCardProps {
  card: MediaCard;
  offset: number;
  isActive: boolean;
  isPlaying: boolean;
  registerRef?: (el: HTMLDivElement | null) => void;
  onSelect: () => void;
  /** Uniquement fourni pour la carte active de type vidéo. */
  activeVideoBinding?: {
    mediaRef: React.RefObject<HTMLMediaElement | null>;
    muted: boolean;
    mediaElementProps: {
      onTimeUpdate: () => void;
      onDurationChange: () => void;
      onEnded: () => void;
    };
  };
}

export function MediaCoverCard({
  card,
  offset,
  isActive,
  isPlaying,
  registerRef,
  onSelect,
  activeVideoBinding,
}: MediaCoverCardProps) {
  const distance = Math.abs(offset);
  const scale = offset === 0 ? 1 : Math.max(0.72, 1 - distance * 0.14);
  const rotate = offset === 0 ? 0 : offset > 0 ? -10 : 10;
  const opacity = Math.max(0.35, 1 - distance * 0.25);

  return (
    <div
      ref={registerRef}
      className="w-28 sm:w-36 md:w-40 lg:w-44 aspect-3/4"
      style={{ perspective: "1000px" }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isActive}
        aria-label={card.title}
        className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(${offset * 68}%) translateY(${offset === 0 ? -8 : 0}px) scale(${scale}) rotateY(${rotate}deg)`,
          opacity,
          zIndex: 10 - distance,
          pointerEvents: distance > 2 ? "none" : "auto",
        }}
      >
        {card.kind === "podcast" && card.coverUrl ? (
          <ProductImage
            src={card.coverUrl}
            alt={card.title}
            fill
            sizes="176px"
            className="object-cover"
          />
        ) : isActive && activeVideoBinding ? (
          <video
            ref={activeVideoBinding.mediaRef as React.RefObject<HTMLVideoElement>}
            src={card.src}
            muted={activeVideoBinding.muted}
            playsInline
            className="w-full h-full object-cover"
            {...activeVideoBinding.mediaElementProps}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))",
            }}
          >
            <Video
              className="w-6 h-6 sm:w-8 sm:h-8"
              style={{ color: "var(--text-tertiary)" }}
            />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/30 to-transparent p-2 sm:p-3">
          <p className="text-white text-[10px] sm:text-xs font-bold truncate">
            {card.title}
          </p>
          <p className="text-white/70 text-[8px] sm:text-[10px] truncate">
            {card.subtitle}
          </p>
        </div>

        {isActive && isPlaying && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        )}
      </button>
    </div>
  );
}
