"use client";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useInteractions } from "@/hooks/useInteractions";
import { Bookmark, Check, Headphones, Heart, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface PodcastCardProps {
  podcast?: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    audioUrl: string;
    mediaType?: "AUDIO" | "VIDEO";
    coverImage?: string | null;
    duration: number;
    publishedAt?: Date | string | null;
    plays: number;
    likesCount: number;
    commentsCount: number;
    bookmarksCount: number;
    category?: { id: string; name: string; slug: string } | null;
    author: {
      id: string;
      username: string;
      firstName?: string | null;
      lastName?: string | null;
      avatar?: string | null;
    };
    interactionState?: { isLiked?: boolean; isBookmarked?: boolean };
  };
  isLoading?: boolean;
  currentUserId?: string;
  isPlaying?: boolean;
  onPlayToggle?: (id: string) => void;
}

export default function PodcastCard({
  podcast,
  isLoading = false,
  currentUserId,
  isPlaying = false,
  onPlayToggle,
}: PodcastCardProps) {
  const audioRef = useRef<HTMLMediaElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  const { isLiked, isBookmarked, isLiking, isBookmarking, toggleLike, toggleBookmark } =
    useInteractions({
      targetId: podcast?.id || "",
      targetType: "podcast",
      authorId: podcast?.author?.id,
      currentUserId,
      initialLiked: podcast?.interactionState?.isLiked || false,
      initialBookmarked: podcast?.interactionState?.isBookmarked || false,
      initialLikesCount: podcast?.likesCount || 0,
    });

  // Formater la durée
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
    }
    return `${minutes}min${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ""}`;
  };

  // Formater le temps de lecture actuel
  const formatCurrentTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Suivre la progression
  useEffect(() => {
    const audio = audioRef.current as HTMLMediaElement | null;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleLoaded = () => setIsAudioLoaded(true);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", handleLoaded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, []);

  // Contrôler la lecture
  useEffect(() => {
    const audio = audioRef.current as HTMLMediaElement | null;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  if (isLoading) {
    return (
      <article
        aria-hidden="true"
        className="w-full animate-pulse rounded-[28px] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.08)]"
      >
        <div className="aspect-square w-full rounded-[22px] bg-neutral-200" />

        <div className="px-1 pb-1 pt-4">
          <div className="h-5 w-3/4 rounded bg-neutral-200" />
          <div className="mt-3 h-3 w-full rounded bg-neutral-100" />
          <div className="mt-2 h-3 w-5/6 rounded bg-neutral-100" />

          <div className="mt-4 flex items-center gap-2">
            <div className="h-11 flex-1 rounded-full bg-neutral-100" />
            <div className="h-11 w-12 rounded-full bg-neutral-200" />
          </div>
        </div>
      </article>
    );
  }

  if (!podcast) {
    return (
      <section className="h-full rounded-2xl border border-amber-100/50 bg-white/80 backdrop-blur-sm min-h-75 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Aucun podcast à afficher</p>
      </section>
    );
  }

  const {
    id,
    title,
    slug,
    description,
    audioUrl,
    mediaType = "AUDIO",
    coverImage,
    duration,
    plays,
    category,
  } = podcast;

  // Gérer la lecture
  const handlePlayToggle = () => {
    if (onPlayToggle) {
      onPlayToggle(id);
    }
  };

  // Barre de progression
  const progress = isAudioLoaded && duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = Math.max(0, duration - currentTime);
  const remainingPercent =
    isAudioLoaded && duration > 0 ? (remaining / duration) * 100 : 100;

  return (
    <article className="w-full rounded-[28px] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.08)]">
      {/* For audio we keep a hidden audio element; for video we render the video in the cover when playing */}
      {mediaType !== "VIDEO" && (
        <audio
          ref={audioRef as React.RefObject<HTMLAudioElement>}
          src={audioUrl}
          preload="metadata"
        />
      )}

      {/* Cover image + overlay play/bookmark/badges */}
      <div className="relative overflow-hidden rounded-[22px] aspect-square w-full">
        {mediaType === "VIDEO" && isPlaying ? (
          <video
            ref={audioRef as React.RefObject<HTMLVideoElement>}
            src={audioUrl}
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            autoPlay
          />
        ) : coverImage ? (
          <div className="relative  aspect-square w-full">
            <Link href={`/podcast/${slug}`} className="block h-full w-full">
              <OptimizedImage
                src={coverImage}
                alt={title}
                fill
                className="object-cover"
              />
            </Link>
          </div>
        ) : (
          <div className=" aspect-square w-full bg-amber-100/30 flex items-center justify-center">
            <Headphones className="w-16 h-16 text-amber-300" />
          </div>
        )}

        <button
          onClick={toggleBookmark}
          disabled={isBookmarking}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
        >
          <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
        </button>

        {/* Badges */}
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="absolute top-3 left-3 z-10 text-xs font-medium text-white bg-black/40 backdrop-blur-md border border-amber-200/30 px-3 py-1 rounded-full hover:bg-black/60 transition-colors"
          >
            {category.name}
          </Link>
        )}

        {/* duration badge removed per request */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 text-xs font-medium text-white bg-black/40 backdrop-blur-md border border-amber-200/30 px-2.5 py-1 rounded-full">
          <Headphones className="h-3 w-3" />
          <span>{plays || 0}</span>
        </div>

        {/* Play overlay */}
        <button
          onClick={handlePlayToggle}
          className="absolute inset-0 w-full h-full flex items-center justify-center z-20 group-hover:bg-black/30 transition-all duration-300"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </div>
        </button>

        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-amber-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content - CardA style */}
      <div className="px-1 pb-1 pt-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="min-w-0 truncate text-[16px] font-bold">{title}</h2>

          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
            <Check size={9} strokeWidth={3} className="text-white" />
          </span>
        </div>

        {description && (
          <p className="mt-2 text-[12px] leading-[1.45] text-black/60">{description}</p>
        )}

        <div className="mt-4 flex gap-2 items-center">
          {/* Progress bar replaces 'Commenter' button */}
          <div className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-black/5 text-[13px] font-medium text-black px-3">
            <div className="flex-1 h-2 rounded-full bg-amber-100 overflow-hidden mx-2">
              {/* Progress bar shows remaining (countdown) */}
              <div
                className="h-full bg-amber-500 transition-all duration-100"
                style={{ width: `${remainingPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {isPlaying ? formatCurrentTime(remaining) : formatDuration(duration)}
            </span>
          </div>

          <button
            onClick={toggleLike}
            disabled={isLiking}
            className={`flex h-11 w-12 items-center justify-center rounded-full bg-black text-white backdrop-blur ${isLiking ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <Heart
              className={`${isLiked ? "fill-current text-rose-500" : ""} h-4 w-4`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
