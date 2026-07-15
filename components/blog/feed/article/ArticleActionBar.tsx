// components/blog/feed/article/ArticleActionBar.tsx
"use client";

import { Bookmark, Heart, Share2 } from "lucide-react";
import { UIArticlePost } from "./ArticleView";

interface ArticleActionBarProps {
  activePost: UIArticlePost;
  likedPosts: string[];
  savedPosts: string[];
  handleLikePost: (postId: string) => Promise<void>;
  handleSavePost: (postId: string) => void;
}

export default function ArticleActionBar({
  activePost,
  likedPosts,
  savedPosts,
  handleLikePost,
  handleSavePost,
}: ArticleActionBarProps) {
  const isLiked = likedPosts.includes(activePost.id);
  const isSaved = savedPosts.includes(activePost.id);

  return (
    <div className="flex items-center gap-4 text-xs font-mono">
      <button
        id="article-like-counter-btn"
        onClick={() => handleLikePost(activePost.id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl frosted-glass transition-all ${
          isLiked
            ? "text-red-400 bg-red-500/10 border-red-500/20"
            : "text-white/60 hover:text-white"
        }`}
      >
        <Heart
          className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
        />
        <span>{activePost.likesCount + (isLiked ? 1 : 0)}</span>
      </button>

      <button
        id="article-save-counter-btn"
        onClick={() => handleSavePost(activePost.id)}
        className={`px-2 py-2 rounded-xl frosted-glass transition-all ${
          isSaved ? "border-(--accent)/20" : "text-white/60 hover:text-white"
        }`}
        style={{
          backgroundColor: isSaved ? "var(--bg-tertiary)" : "transparent",
          color: isSaved ? "var(--accent)" : "",
          borderColor: isSaved ? "var(--accent)" : "transparent",
        }}
      >
        <Bookmark
          className={`flex w-4 h-4 ${isSaved ? "fill-(--accent) text-(--accent)" : ""}`}
        />
      </button>

      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: activePost.title,
              text: activePost.excerpt,
              url: window.location.href,
            });
          }
        }}
        className="px-4 py-2 rounded-xl frosted-glass transition-all text-white/60 hover:text-white"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}
