// components/blog/podcast/PodcastCard.tsx
"use client";

import ProductImage from "@/components/ProductImage";
import { Clock, Headphones, Play, User } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";

export interface PodcastCardData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  audio_url: string;
  podcastDuration: string;
  authorId: string;
  authorName: string;
  status: "published";
  type: "podcast";
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  likesCount: number;
  commentsCount: number;
}

interface PodcastCardProps {
  podcast: PodcastCardData;
  isFollowing?: boolean;
  onFollow?: (authorId: string) => void;
  onViewPost?: (postId: string) => void;
  className?: string;
}

export default function PodcastCard({
  podcast,
  isFollowing = false,
  onFollow,
  onViewPost,
  className = "",
}: PodcastCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Gestion de l'audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setIsPlaying(false));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFollowClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onFollow?.(podcast.authorId);
  };

  const handleCardClick = () => {
    onViewPost?.(podcast.id);
  };

  return (
    <article
      className={`rounded-2xl border p-4 md:p-6 transition-all hover:border-(--accent) ${className}`}
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--bg-secondary)",
      }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >
      {/* Audio élément caché */}
      <audio ref={audioRef} src={podcast.audio_url} preload="metadata" />

      {/* En-tête mobile first */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        {/* Image de couverture */}
        <div
          className="relative aspect-square w-full sm:w-24 md:w-28 lg:w-32 shrink-0 overflow-hidden rounded-2xl"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <ProductImage
            src={podcast.imageUrl}
            alt={podcast.title}
            fill
            sizes="(max-width: 640px) 100vw, 128px"
            className="object-cover"
          />
          {/* Badge de lecture */}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 bg-white rounded-full animate-pulse" />
                <span className="w-1.5 h-6 bg-white rounded-full animate-pulse delay-100" />
                <span className="w-1.5 h-3 bg-white rounded-full animate-pulse delay-200" />
              </div>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="text-base md:text-lg font-display font-semibold line-clamp-2 transition"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
              >
                {podcast.title}
              </h3>
              <p
                className="mt-1 text-xs md:text-sm line-clamp-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {podcast.excerpt}
              </p>
            </div>
            <button
              type="button"
              onClick={handleFollowClick}
              className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full transition`}
              style={{
                backgroundColor: isFollowing
                  ? "var(--bg-tertiary)"
                  : "var(--bg-tertiary)",
                color: isFollowing ? "var(--text-primary)" : "var(--accent)",
                border: isFollowing ? "none" : `1px solid var(--accent)`,
              }}
            >
              {isFollowing ? "✓ Abonné" : "+ Suivre"}
            </button>
          </div>

          {/* Métadonnées */}
          <div
            className="mt-3 flex flex-wrap items-center gap-3 text-[10px] md:text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {podcast.authorName}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {podcast.podcastDuration}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              {podcast.likesCount} écoutes
            </span>
          </div>
        </div>
      </div>

      {/* Player audio */}
      <div
        className="mt-4 pt-4 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          {/* Bouton play */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full transition flex items-center justify-center"
            style={{
              backgroundColor: "var(--bg-tertiary)",
            }}
            aria-label={isPlaying ? "Pause" : "Écouter"}
          >
            {isPlaying ? (
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-4 bg-white" />
                <span className="w-1 h-4 bg-white" />
              </div>
            ) : (
              <Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-white ml-0.5" />
            )}
          </button>

          {/* Barre de progression */}
          <div className="flex-1 min-w-0 flex items-center gap-2 md:gap-3">
            <span
              className="text-[10px] md:text-xs font-mono tabular-nums min-w-8"
              style={{ color: "var(--text-tertiary)" }}
            >
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                e.stopPropagation();
                handleSeek(e);
              }}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                accentColor: "var(--accent)",
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
              aria-label="Progression du podcast"
            />
            <span className="text-[10px] md:text-xs text-white/40 font-mono tabular-nums min-w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

// Version skeleton pour le chargement
export function PodcastCardSkeleton() {
  return (
    <div
      className="rounded-2xl border p-4 md:p-6 animate-pulse"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        <div
          className="aspect-square w-full sm:w-24 md:w-28 lg:w-32 rounded-2xl"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        />
        <div className="flex-1 space-y-3">
          <div
            className="h-5 rounded w-3/4"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          />
          <div
            className="h-4 rounded w-full"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          />
          <div
            className="h-4 rounded w-2/3"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          />
          <div className="flex gap-4">
            <div
              className="h-3 rounded w-20"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
            <div
              className="h-3 rounded w-16"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
          </div>
        </div>
      </div>
      <div
        className="mt-4 pt-4 border-t flex items-center gap-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="w-10 h-10 rounded-full"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        />
        <div
          className="flex-1 h-2 rounded"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        />
        <div
          className="w-12 h-2 rounded"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        />
      </div>
    </div>
  );
}
