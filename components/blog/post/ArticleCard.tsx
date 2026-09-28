"use client";

import { useInteractions } from "@/hooks/useInteractions";
import { FeedItem } from "@/lib/services/feed.service";
import { Bookmark, Check, Heart, Send } from "lucide-react";
import Image from "next/image";

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
  const safePost = post ?? null;

  const interactionState = safePost?.interactionState;
  const postData = safePost?.post;
  const author = safePost?.author;

  const { isLiked, isBookmarked, isLiking, isBookmarking, toggleLike, toggleBookmark } =
    useInteractions({
      targetId: postData?.id || "",
      targetType: "post",
      authorId: author?.id,
      currentUserId,
      initialLiked: interactionState?.isLiked || false,
      initialBookmarked: interactionState?.isBookmarked || false,
      initialLikesCount: postData?.likesCount || 0,
    });

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

  if (!post || !postData || !author) {
    return (
      <section className="flex h-full min-h-75 items-center justify-center rounded-2xl border border-amber-100/50 bg-white/80 backdrop-blur-sm">
        <p className="text-sm text-gray-500">Aucun article à afficher</p>
      </section>
    );
  }

  function VerifiedBadge() {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
        <Check size={9} strokeWidth={3} className="text-white" />
      </span>
    );
  }

  const summary =
    (typeof postData.excerpt === "string" && postData.excerpt.trim().length > 0
      ? postData.excerpt
      : `${author.firstName || author.username}`) ||
    `${author.firstName || author.username}`;

  return (
    <article className="w-full rounded-[28px] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.08)]">
      <div className="relative overflow-hidden rounded-[22px]">
        {postData.coverImage ? (
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={postData.coverImage}
              alt={postData.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-square w-full bg-amber-100/30" />
        )}

        <button
          onClick={toggleBookmark}
          disabled={isBookmarking}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
        >
          <Bookmark className={`${isBookmarked ? "fill-current" : ""} h-5 w-5`} />
        </button>
      </div>

      <div className="px-1 pb-1 pt-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="min-w-0 truncate text-[16px] font-bold">{postData.title}</h2>

          <VerifiedBadge />
        </div>

        <p className="mt-2 line-clamp-3 text-[12px] leading-[1.45] text-black/60">
          {summary}
        </p>
        <div className="mt-4 flex gap-2">
          <button className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-black text-[13px] font-medium text-white">
            <Send size={16} />
            Commenter
          </button>

          <button
            onClick={toggleLike}
            disabled={isLiking}
            className={`flex h-11 w-12 items-center justify-center rounded-full bg-black text-white backdrop-blur ${
              isLiking ? "cursor-not-allowed opacity-50" : ""
            }`}
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
