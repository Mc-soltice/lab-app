// components/ui/Card.tsx
"use client";
import { useInteractions } from "@/hooks/useInteractions";
import { FeedItem } from "@/lib/services/feed.service";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bookmark, Heart, MessageCircle, UserCheck } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "./OptimizedImage";

interface CardProps {
  post?: FeedItem;
  isLoading?: boolean;
  currentUserId?: string;
}

export default function Card({
  post,
  isLoading = false,
  currentUserId,
}: CardProps) {
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

  if (!post) {
    return (
      <section className="h-full rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] min-h-75 flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Aucun article à afficher</p>
      </section>
    );
  }

  const { post: postData, author, interactionState } = post;
  const publishedDate = postData.publishedAt
    ? format(new Date(postData.publishedAt), "dd MMMM yyyy", { locale: fr })
    : "Date non disponible";

  const {
    isLiked,
    isBookmarked,
    isFollowing,
    likesCount,
    isLiking,
    isBookmarking,
    isFollowingAction,
    toggleLike,
    toggleBookmark,
    toggleFollow,
    canFollow,
  } = useInteractions({
    targetId: postData.id,
    targetType: "post",
    authorId: author.id,
    authorUsername: author.username,
    currentUserId,
    initialLiked: interactionState?.isLiked || false,
    initialBookmarked: interactionState?.isBookmarked || false,
    initialFollowing: interactionState?.isFollowing || false,
    initialLikesCount: postData.likesCount || 0,
  });

  return (
    <article className="group/card h-full flex flex-col rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] hover:border-neutral-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 overflow-hidden">
      {/* Header - glassmorphism léger */}
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

      {/* Content - image avec dégradé de lisibilité */}
      <div className="relative w-full aspect-4/3 overflow-hidden">
        <Link
          href={`/post/${postData.slug}`}
          className="block group h-full w-full"
        >
          {postData.coverOptimizedImage ? (
            <OptimizedImage
              src={postData.coverOptimizedImage}
              alt={postData.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-neutral-800 to-neutral-900" />
          )}
          {/* dégradé bas pour lisibilité future */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {postData.category && (
          <Link
            href={`/category/${postData.category.slug}`}
            className="absolute top-3 left-3 z-10 text-xs font-medium text-white bg-black/50 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full hover:bg-black/70 hover:border-white/25 transition-colors"
          >
            {postData.category.name}
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 p-4 mt-auto">
        <Link href={`/post/${postData.slug}`}>
          <h2 className="text-white font-semibold text-[15px] leading-snug hover:text-blue-400 transition-colors line-clamp-2">
            {postData.title}
          </h2>
        </Link>

        <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
          <div className="flex items-center gap-4 text-neutral-400 pt-3">
            <button
              onClick={toggleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 transition-all duration-200 active:scale-90 ${
                isLiked ? "text-red-500" : "hover:text-red-400"
              } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium tabular-nums">
                {likesCount}
              </span>
            </button>

            <Link
              href={`/post/${postData.slug}#comments`}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm tabular-nums">
                {postData.commentsCount || 0}
              </span>
            </Link>
          </div>

          <button
            onClick={toggleBookmark}
            disabled={isBookmarking}
            className={`pt-3 transition-all duration-200 active:scale-90 ${
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
