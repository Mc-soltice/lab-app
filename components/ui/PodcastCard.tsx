// components/ui/PodcastCard.tsx
"use client";
import { useInteractions } from "@/hooks/useInteractions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bookmark,
  Clock,
  Headphones,
  Heart,
  MessageCircle,
  Pause,
  Play,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import OptimizedImage from "./OptimizedImage";

interface PodcastCardProps {
  podcast?: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    audioUrl: string;
    coverImage?: string | null;
    duration: number;
    publishedAt?: Date | string | null;
    plays: number;
    likesCount: number;
    commentsCount: number;
    bookmarksCount: number;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
    author: {
      id: string;
      username: string;
      firstName?: string | null;
      lastName?: string | null;
      avatar?: string | null;
    };
    interactionState?: {
      isLiked?: boolean;
      isBookmarked?: boolean;
      isFollowing?: boolean;
    };
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  // Version skeleton (chargement) avec shimmer
  if (isLoading) {
    return (
      <section className="relative h-full rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] flex flex-col overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-neutral-700/60" />
            <div className="h-3 w-14 rounded-full bg-neutral-700/60" />
            <div className="h-2 w-2 rounded-full bg-neutral-700/60" />
          </div>
          <div className="h-6 w-16 rounded-full bg-neutral-700/60" />
        </div>
        <div className="w-full aspect-4/3 bg-neutral-800/60" />
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="h-5 w-10 rounded-full bg-neutral-700/60" />
              <div className="h-5 w-10 rounded-full bg-neutral-700/60" />
            </div>
            <div className="h-5 w-5 rounded-full bg-neutral-700/60" />
          </div>
          <div className="h-4 w-3/4 rounded-full bg-neutral-700/60" />
        </div>
      </section>
    );
  }

  if (!podcast) {
    return (
      <section className="h-full rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] min-h-75 flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Aucun podcast à afficher</p>
      </section>
    );
  }

  const {
    id,
    title,
    slug,
    description,
    audioUrl,
    coverImage,
    duration,
    publishedAt,
    plays,
    likesCount,
    commentsCount,
    category,
    author,
    interactionState,
  } = podcast;

  const publishedDate = publishedAt
    ? format(new Date(publishedAt), "dd MMMM yyyy", { locale: fr })
    : "Date non disponible";

  const {
    isLiked,
    isBookmarked,
    isFollowing,
    likesCount: currentLikesCount,
    isLiking,
    isBookmarking,
    isFollowingAction,
    toggleLike,
    toggleBookmark,
    toggleFollow,
    canFollow,
  } = useInteractions({
    targetId: id,
    targetType: "podcast",
    authorId: author.id,
    authorUsername: author.username,
    currentUserId,
    initialLiked: interactionState?.isLiked || false,
    initialBookmarked: interactionState?.isBookmarked || false,
    initialFollowing: interactionState?.isFollowing || false,
    initialLikesCount: likesCount || 0,
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

  // Gérer la lecture
  const handlePlayToggle = () => {
    if (onPlayToggle) {
      onPlayToggle(id);
    }
  };

  // Suivre la progression
  useEffect(() => {
    const audio = audioRef.current;
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
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Barre de progression
  const progress =
    isAudioLoaded && duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <article className="group/card h-full flex flex-col rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] hover:border-neutral-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 overflow-hidden">
      {/* Audio caché pour la lecture */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 bg-white/2 backdrop-blur-sm p-4">
        <Link
          href={`/@${author.username}`}
          className="flex flex-wrap items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
        >
          {author.avatar ? (
            <OptimizedImage
              src={author.avatar}
              alt={`${author.firstName || author.username} avatar`}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-white/10"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 ring-1 ring-white/10">
              <span className="text-white text-sm font-medium">
                {(author.firstName?.[0] || author.username[0]).toUpperCase()}
              </span>
            </div>
          )}

          <span className="text-white font-medium text-sm truncate max-w-24">
            {author.firstName && author.lastName
              ? `${author.firstName} ${author.lastName}`
              : author.username}
          </span>

          <span className="relative h-2 w-2 shrink-0">
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-green-500 block" />
          </span>

          <span className="text-neutral-500 text-xs shrink-0">
            {publishedDate}
          </span>
        </Link>

        {canFollow && (
          <button
            onClick={toggleFollow}
            disabled={isFollowingAction}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 shrink-0 active:scale-95 ${
              isFollowing
                ? "bg-neutral-800 text-white hover:bg-neutral-700 ring-1 ring-white/10"
                : "bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 ring-1 ring-blue-500/20"
            } ${isFollowingAction ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="h-3.5 w-3.5" />
                <span>Suivi</span>
              </>
            ) : (
              <span>Suivre</span>
            )}
          </button>
        )}
      </div>

      {/* Cover image avec overlay audio */}
      <div className="relative w-full aspect-4/3 overflow-hidden">
        <Link href={`/podcast/${slug}`} className="block group h-full w-full">
          {coverImage ? (
            <OptimizedImage
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
              <Headphones className="w-16 h-16 text-neutral-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Badge catégorie */}
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="absolute top-3 left-3 z-10 text-xs font-medium text-white bg-black/50 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full hover:bg-black/70 hover:border-white/25 transition-colors"
          >
            {category.name}
          </Link>
        )}

        {/* Badge durée */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-xs font-medium text-white bg-black/50 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full">
          <Clock className="h-3 w-3" />
          <span>{formatDuration(duration)}</span>
        </div>

        {/* Badge plays */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 text-xs font-medium text-white bg-black/50 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full">
          <Headphones className="h-3 w-3" />
          <span>{plays || 0}</span>
        </div>

        {/* Bouton play/pause overlay */}
        <button
          onClick={handlePlayToggle}
          className="absolute inset-0 w-full h-full flex items-center justify-center z-20 group-hover:bg-black/30 transition-all duration-300"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </div>
        </button>

        {/* Barre de progression (sur l'image) */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 p-4 mt-auto">
        <Link href={`/podcast/${slug}`}>
          <h2 className="text-white font-semibold text-[15px] leading-snug hover:text-blue-400 transition-colors line-clamp-2">
            {title}
          </h2>
          {description && (
            <p className="text-neutral-400 text-sm line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </Link>

        {/* Contrôles audio mini */}
        <div className="flex items-center gap-3 pt-1 border-t border-neutral-800/60">
          <button
            onClick={handlePlayToggle}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            <div className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors">
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5 ml-0.5" />
              )}
            </div>
            <span>
              {isPlaying
                ? formatCurrentTime(currentTime)
                : formatDuration(duration)}
            </span>
          </button>

          {/* Barre de progression mini */}
          <div className="flex-1 h-1 rounded-full bg-neutral-700 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={toggleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 transition-all duration-200 active:scale-90 ${
                isLiked ? "text-red-500" : "hover:text-red-400"
              } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium tabular-nums">
                {currentLikesCount}
              </span>
            </button>

            <Link
              href={`/podcast/${slug}#comments`}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm tabular-nums">{commentsCount || 0}</span>
            </Link>
          </div>

          <button
            onClick={toggleBookmark}
            disabled={isBookmarking}
            className={`transition-all duration-200 active:scale-90 ${
              isBookmarked
                ? "text-blue-400"
                : "text-neutral-400 hover:text-blue-400"
            } ${isBookmarking ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Bookmark
              className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
