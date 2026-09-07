// app/blog/[slug]/page.tsx (version corrigée)
"use client";

import { ArticleView } from "@/components/blog/feed/article";
import { useAuthContext } from "@/contexts/auth/auth.context";
import { usePostDetail } from "@/hooks/blog/post/usePostDetail";
import { useContentInteractions } from "@/hooks/useContentInteractions";
import { motion } from "framer-motion";
import { BouncyArc } from "ldrs/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const slug = params.slug as string;

  const {
    commentAuthor,
    setCommentAuthor,
    commentText,
    setCommentText,
    adaptedPost,
    adaptedComments,
    likedPosts,
    savedPosts,
    isLoading,
    isError,
    error,
    isSubmittingComment,
    handleCommentFormSubmit,
    handleLikePost,
    handleSavePost,
    handleDeleteComment,
    setActiveView,
    setSelectedAuthorId,
    reload,
  } = useContentInteractions({
    slug,
    detailHook: usePostDetail,
    buildAdaptedPost: (post: any, author: any, likesCount: number) => {
      const authorDisplayName = author
        ? [author.firstName, author.lastName].filter(Boolean).join(" ") ||
          author.username ||
          author.id
        : post.authorId || "Utilisateur";

      const authorInitial =
        author?.firstName?.[0] ||
        author?.lastName?.[0] ||
        author?.username?.[0] ||
        post.authorId?.[0] ||
        "U";

      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || "",
        content: post.content,
        imageUrl: post.coverImage || "/blog/placeholder.jpg",
        category: post.category?.name || "Non catégorisé",
        authorId: post.authorId,
        authorName: authorDisplayName,
        authorRole: author?.bio || "Auteur",
        authorAvatar:
          author?.avatar ||
          `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(authorInitial)}`,
        date: new Date(post.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        readingTime: `${Math.ceil((post.content?.length || 0) / 1000)} min`,
        likesCount,
        tags: post.tags.map((tag: any) => tag.name).filter(Boolean),
      };
    },
    buildAdaptedComments: (comments: any[], postId?: string) =>
      comments.map((comment) => ({
        id: comment.id,
        text: comment.content,
        authorName:
          [comment.author.firstName, comment.author.lastName]
            .filter(Boolean)
            .join(" ") || comment.author.username,
        authorAvatar:
          comment.author.avatar ||
          `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(comment.author.username?.[0] || "U")}`,
        postId: postId || "",
        approved: true,
        createdAt: comment.createdAt,
      })),
  });

  useEffect(() => {
    if (!isLoading && !adaptedPost && !isError) {
      toast.error("Article non trouvé");
      router.push("/blog");
    }
  }, [adaptedPost, isLoading, router, isError]);

  // Gestion des erreurs
  if (isError) {
    return (
      <div
        className="min-h-screen py-8 px-4"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-2xl font-light mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Article introuvable
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            {error?.message ||
              "L'article que vous recherchez n'existe pas ou a été supprimé."}
          </p>
          <button
            onClick={() => router.push("/blog")}
            className="px-6 py-2 text-sm font-medium rounded-xl transition-opacity"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Retour au blog
          </button>
        </div>
      </div>
    );
  }

  // État de chargement
  if (isLoading || !adaptedPost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-950/20 via-transparent to-blue-950/10">
        <BouncyArc size="90" speed="1.65" color="blue" />

        <p className="text-sm font-light text-blue-300/80 tracking-[0.2em] ">
          Patience...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <ArticleView
        activePost={adaptedPost}
        // ✅ Utilisation des tableaux typés correctement
        likedPosts={likedPosts}
        savedPosts={savedPosts}
        comments={adaptedComments}
        userReactions={{}}
        commentAuthor={commentAuthor}
        setCommentAuthor={setCommentAuthor}
        commentText={commentText}
        setCommentText={setCommentText}
        isSubmittingComment={isSubmittingComment}
        activeProfile={
          user
            ? {
                name:
                  [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                  user.username,
                avatar:
                  user.avatar ||
                  `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${user.username?.[0] || "U"}`,
                roleLabel: user.role === "ADMIN" ? "Admin" : "Blogger",
              }
            : null
        }
        handleLikePost={handleLikePost}
        handleSavePost={handleSavePost}
        handleToggleReaction={() => {}}
        handleCommentFormSubmit={handleCommentFormSubmit}
        setActiveView={setActiveView}
        setSelectedAuthorId={setSelectedAuthorId}
        setAdminTab={(tab) => {
          console.log("Admin tab:", tab);
        }}
      />

      {/* Bouton de rafraîchissement */}
      <div className="max-w-4xl mx-auto mt-4 flex justify-end">
        <button
          onClick={reload}
          className="text-xs text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
        >
          ↻ Rafraîchir
        </button>
      </div>
    </motion.div>
  );
}
