// components/blog/article/ArticleView.tsx
"use client";

import { motion } from "framer-motion";
import * as React from "react";
import ArticleActionBar from "./ArticleActionBar";
import ArticleContent from "./ArticleContent";
import ArticleHeader from "./ArticleHeader";
import CommentsSection from "./CommentsSection";

// Types adaptés pour l'UI
export interface UIComment {
  id: string;
  text: string;
  authorName: string;
  authorAvatar: string;
  postId: string;
  approved: boolean;
  createdAt: Date | string;
}

export interface UIArticlePost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  readingTime: string;
  likesCount: number;
  tags?: string[];
}

export interface ArticleViewProps {
  activePost: UIArticlePost;
  likedPosts: string[];
  savedPosts: string[];
  comments: UIComment[];
  userReactions: Record<string, string[]>;
  commentAuthor: string;
  setCommentAuthor: (a: string) => void;
  commentText: string;
  setCommentText: (t: string) => void;
  isSubmittingComment: boolean;
  activeProfile?: any;
  handleLikePost: (postId: string) => Promise<void>;
  handleSavePost: (postId: string) => void;
  handleToggleReaction: (postId: string, reactionId: string) => void;
  handleCommentFormSubmit: (e: React.FormEvent) => void;
  setActiveView: (view: "feed" | "article" | "author" | "admin") => void;
  setSelectedAuthorId: (id: string | null) => void;
  setAdminTab?: (tab: "dashboard" | "articles" | "comments" | "activities") => void;
}

export default function ArticleView({
  activePost,
  likedPosts,
  savedPosts,
  comments,
  userReactions,
  commentAuthor,
  setCommentAuthor,
  commentText,
  setCommentText,
  isSubmittingComment,
  activeProfile,
  handleLikePost,
  handleSavePost,
  handleToggleReaction,
  handleCommentFormSubmit,
  setActiveView,
  setSelectedAuthorId,
  setAdminTab,
}: ArticleViewProps) {
  return (
    <motion.div
      id="article-reader-root"
      key="article-detail"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto flex flex-col gap-6 w-full"
      style={
        {
          "--ra-paper": "#F4EEDF",
          "--ra-paper-alt": "#ECE3CC",
          "--ra-ink": "#22281F",
          "--ra-ink-soft": "#5B5A46",
          "--ra-green": "#204331",
          "--ra-amber": "#B07B2C",
          "--ra-bordeaux": "#7C2B32",
          "--ra-rule": "#D9CDA8",
          "--ra-rule-strong": "#A8946A",
        } as React.CSSProperties
      }
    >
      {/* Typographie du registre — scopée à cette vue */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        #article-reader-root .font-serif { font-family: 'IBM Plex Serif', Georgia, serif; }
        #article-reader-root .font-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      `}</style>

      <ArticleHeader
        activePost={activePost}
        setActiveView={setActiveView}
        setSelectedAuthorId={setSelectedAuthorId}
      />

      <div className="flex items-center justify-end">
        <ArticleActionBar
          activePost={activePost}
          likedPosts={likedPosts}
          savedPosts={savedPosts}
          handleLikePost={handleLikePost}
          handleSavePost={handleSavePost}
        />
      </div>

      <ArticleContent activePost={activePost} />

      <CommentsSection
        comments={comments}
        postId={activePost.id}
        commentAuthor={commentAuthor}
        setCommentAuthor={setCommentAuthor}
        commentText={commentText}
        setCommentText={setCommentText}
        isSubmittingComment={isSubmittingComment}
        activeProfile={activeProfile}
        handleCommentFormSubmit={handleCommentFormSubmit}
      />
    </motion.div>
  );
}
