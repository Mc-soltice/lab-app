// app/(user)/post/[slug]/page.tsx
"use client";

import ArticleView, { UIArticlePost } from "@/components/blog/feed/article/ArticleView";
import { usePostDetail } from "@/hooks/blog/post/usePostDetail";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function ArticleDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug as string;

  console.log("🚀 [ArticleDetailPage] Composant monté!");
  console.log("[ArticleDetailPage] params:", params);
  console.log("[ArticleDetailPage] Slug extrait:", slug, "Type:", typeof slug);

  const {
    post,
    comments,
    isLoading,
    isError,
    error,
    isLiked,
    isBookmarked,
    likesCount,
    isSubmittingComment,
    toggleLike,
    toggleBookmark,
    submitComment,
  } = usePostDetail(slug, {
    fetchComments: true,
    commentsLimit: 10,
  });

  // États pour les commentaires UI
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");

  // Mapper les données du post vers le format UI
  const activePost: UIArticlePost | null = useMemo(() => {
    if (!post) return null;

    const authorName = post.author
      ? [post.author.firstName, post.author.lastName].filter(Boolean).join(" ") ||
        post.author.username
      : "Auteur inconnu";

    const wordsPerMinute = 200;
    const words = post.content?.split(/\s+/).length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    const readingTime = `${minutes} min de lecture`;

    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      imageUrl: post.coverImage || "",
      category: post.category?.name || "Non catégorisé",
      authorId: post.authorId,
      authorName,
      authorRole: post.author?.bio || "Auteur",
      authorAvatar: post.author?.avatar || "",
      date: post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "",
      readingTime,
      likesCount: likesCount,
      tags: post.tags?.map((t) => t.name) || [],
    };
  }, [post, likesCount]);

  // Mapper les commentaires vers le format UI
  const uiComments = useMemo(() => {
    return comments.map((c) => ({
      id: c.id,
      text: c.content,
      authorName: c.author?.username || "Anonyme",
      authorAvatar: c.author?.avatar || "",
      postId: post?.id || "",
      approved: true,
      createdAt: c.createdAt,
    }));
  }, [comments, post?.id]);

  // Gestionnaires
  const handleLikePost = useCallback(
    async (postId: string) => {
      await toggleLike();
    },
    [toggleLike],
  );

  const handleSavePost = useCallback(
    (postId: string) => {
      void toggleBookmark();
    },
    [toggleBookmark],
  );

  const handleToggleReaction = useCallback((postId: string, reactionId: string) => {
    // Réactions non implémentées pour l'instant
    console.log("Reaction:", reactionId);
  }, []);

  const handleCommentFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      const result = await submitComment(commentText);
      if (result) {
        setCommentText("");
      }
    },
    [commentText, submitComment],
  );

  const setActiveView = useCallback(
    (view: "feed" | "article" | "author" | "admin") => {
      if (view === "feed") {
        router.push("/post");
      }
    },
    [router],
  );

  const setSelectedAuthorId = useCallback(
    (id: string | null) => {
      if (id) {
        router.push(`/user/${id}`);
      }
    },
    [router],
  );

  // États de chargement
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-800 rounded w-1/3" />
          <div className="aspect-video bg-neutral-800 rounded-3xl" />
          <div className="space-y-3">
            <div className="h-4 bg-neutral-800 rounded w-full" />
            <div className="h-4 bg-neutral-800 rounded w-5/6" />
            <div className="h-4 bg-neutral-800 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Article introuvable
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          {error?.message ||
            "L'article que vous recherchez n'existe pas ou a été supprimé."}
        </p>
        <button
          onClick={() => router.push("/post")}
          className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: "var(--accent)", color: "var(--text-primary)" }}
        >
          Retour au flux
        </button>
      </div>
    );
  }

  if (!activePost) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-4">
      <ArticleView
        activePost={activePost}
        likedPosts={isLiked ? [activePost.id] : []}
        savedPosts={isBookmarked ? [activePost.id] : []}
        comments={uiComments}
        userReactions={{}}
        commentAuthor={commentAuthor}
        setCommentAuthor={setCommentAuthor}
        commentText={commentText}
        setCommentText={setCommentText}
        isSubmittingComment={isSubmittingComment}
        activeProfile={undefined}
        handleLikePost={handleLikePost}
        handleSavePost={handleSavePost}
        handleToggleReaction={handleToggleReaction}
        handleCommentFormSubmit={handleCommentFormSubmit}
        setActiveView={setActiveView}
        setSelectedAuthorId={setSelectedAuthorId}
      />
    </main>
  );
}
