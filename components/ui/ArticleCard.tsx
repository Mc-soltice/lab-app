"use client";

import { useInteractions } from "@/hooks/useInteractions";
import { FeedItem } from "@/lib/services/feed.service";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "./OptimizedImage";

interface ArticleCardProps {
  post?: FeedItem;
  isLoading?: boolean;
  currentUserId?: string;
}

export default function ArticleCard({
  post,
  isLoading = false,
  currentUserId,
}: ArticleCardProps) {
  if (isLoading) {
    return (
      <section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-amber-100/50 bg-white/80 backdrop-blur-sm">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-linear-to-r from-transparent via-amber-400/10 to-transparent" />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100/50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-100/50" />
            <div className="h-3 w-14 rounded-full bg-amber-100/50" />
            <div className="h-2 w-2 rounded-full bg-amber-100/50" />
          </div>
          <div className="h-6 w-16 rounded-full bg-amber-100/50" />
        </div>
        <div className="aspect-4/3 w-full bg-amber-100/50" />
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="h-5 w-10 rounded-full bg-amber-100/50" />
              <div className="h-5 w-10 rounded-full bg-amber-100/50" />
            </div>
            <div className="h-5 w-5 rounded-full bg-amber-100/50" />
          </div>
          <div className="h-4 w-3/4 rounded-full bg-amber-100/50" />
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="flex h-full min-h-75 items-center justify-center rounded-2xl border border-amber-100/50 bg-white/80 backdrop-blur-sm">
        <p className="text-sm text-gray-500">Aucun article à afficher</p>
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
    likesCount,
    isLiking,
    isBookmarking,
    toggleLike,
    toggleBookmark,
  } = useInteractions({
    targetId: postData.id,
    targetType: "post",
    authorId: author.id,
    currentUserId,
    initialLiked: interactionState?.isLiked || false,
    initialBookmarked: interactionState?.isBookmarked || false,
    initialLikesCount: postData.likesCount || 0,
  });

  return (
    <article className="group/card flex h-full flex-col overflow-hidden rounded-2xl border border-amber-100/50 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100/50 bg-amber-50/30 p-4">
        <Link
          href={`/@${author.username}`}
          className="flex min-w-0 flex-wrap items-center gap-2 transition-opacity hover:opacity-80"
        >
          {author.avatar ? (
            <OptimizedImage
              src={author.avatar}
              alt={`${author.firstName || author.username} avatar`}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-amber-200/50"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-rose-400 ring-1 ring-amber-200/50">
              <span className="text-sm font-medium text-white">
                {(author.firstName?.[0] || author.username[0]).toUpperCase()}
              </span>
            </div>
          )}

          <span className="max-w-24 truncate text-sm font-medium text-gray-800">
            {author.firstName && author.lastName
              ? `${author.firstName} ${author.lastName}`
              : author.username}
          </span>

          <span className="relative h-2 w-2 shrink-0">
            <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-75 animate-ping" />
            <span className="relative block h-2 w-2 rounded-full bg-emerald-500" />
          </span>

          <span className="shrink-0 text-xs text-gray-500">{publishedDate}</span>
        </Link>
      </div>

      <div className="relative aspect-4/3 w-full overflow-hidden">
        <Link href={`/post/${postData.slug}`} className="group block h-full w-full">
          {postData.coverImage ? (
            <OptimizedImage
              src={postData.coverImage}
              alt={postData.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="h-full w-full bg-amber-100/30" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-amber-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {postData.category && (
          <Link
            href={`/category/${postData.category.slug}`}
            className="absolute left-3 top-3 z-10 rounded-full border border-amber-200/30 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            {postData.category.name}
          </Link>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3 p-4">
        <Link href={`/post/${postData.slug}`}>
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-800 transition-colors hover:text-amber-700">
            {postData.title}
          </h2>
        </Link>

        <div className="flex items-center justify-between border-t border-amber-100/30 pt-1">
          <div className="flex items-center gap-4 pt-3 text-gray-500">
            <button
              onClick={toggleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 transition-all duration-200 active:scale-90 ${
                isLiked ? "text-rose-500" : "hover:text-rose-400"
              } ${isLiking ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium tabular-nums">{likesCount}</span>
            </button>

            <Link
              href={`/post/${postData.slug}#comments`}
              className="flex items-center gap-1.5 text-gray-500 transition-colors hover:text-amber-600"
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
              isBookmarked ? "text-amber-500" : "text-gray-400 hover:text-amber-400"
            } ${isBookmarking ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
