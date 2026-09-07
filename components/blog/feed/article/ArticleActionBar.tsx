// components/blog/article/ArticleActionBar.tsx
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
    <div className="flex items-center gap-3 font-mono text-[11px]">
      <button
        id="article-like-counter-btn"
        onClick={() => handleLikePost(activePost.id)}
        className="flex items-center gap-2 px-3.5 py-2 border-2 rounded-sm uppercase tracking-wider font-semibold transition-all"
        style={{
          borderColor: isLiked ? "var(--ra-bordeaux)" : "var(--ra-rule)",
          color: isLiked ? "var(--ra-bordeaux)" : "var(--ra-ink-soft)",
          backgroundColor: isLiked ? "rgba(124,43,50,0.06)" : "transparent",
          transform: isLiked ? "rotate(-1deg)" : "none",
        }}
      >
        <Heart
          className="w-3.5 h-3.5"
          style={{ fill: isLiked ? "var(--ra-bordeaux)" : "none" }}
        />
        {activePost.likesCount + (isLiked ? 1 : 0)}
      </button>

      <button
        id="article-save-counter-btn"
        onClick={() => handleSavePost(activePost.id)}
        className="flex items-center gap-2 px-3.5 py-2 border-2 rounded-sm uppercase tracking-wider font-semibold transition-all"
        style={{
          borderColor: isSaved ? "var(--ra-green)" : "var(--ra-rule)",
          color: isSaved ? "var(--ra-green)" : "var(--ra-ink-soft)",
          backgroundColor: isSaved ? "rgba(32,67,49,0.06)" : "transparent",
          transform: isSaved ? "rotate(1deg)" : "none",
        }}
      >
        <Bookmark
          className="w-3.5 h-3.5"
          style={{ fill: isSaved ? "var(--ra-green)" : "none" }}
        />
        {isSaved ? "Archivé" : "Archiver"}
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
        className="flex items-center gap-2 px-3.5 py-2 border-2 rounded-sm uppercase tracking-wider font-semibold transition-all"
        style={{ borderColor: "var(--ra-rule)", color: "var(--ra-ink-soft)" }}
      >
        <Share2 className="w-3.5 h-3.5" />
        Partager
      </button>
    </div>
  );
}
