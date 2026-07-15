// app/blog/[slug]/page.tsx (version corrigée)
"use client";

import { ArticleView } from "@/components/blog/feed/article";
import { useAuthContext } from "@/contexts/auth/auth.context";
import { usePostDetail } from "@/hooks/blog/post/usePostDetail";
import { motion } from "framer-motion";
import { BouncyArc } from "ldrs/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const slug = params.slug as string;

  // État local pour le formulaire de commentaire
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");

  // Utilisation du hook
  const {
    post,
    author,
    comments,
    isLoading,
    isError,
    error,
    isLiked,
    isBookmarked,
    likesCount,
    isLiking,
    isBookmarking,
    isSubmittingComment,
    toggleLike,
    toggleBookmark,
    submitComment,
    deleteComment,
    canInteract,
    isOwnContent,
    reload,
  } = usePostDetail(slug, {
    fetchComments: true,
    commentsLimit: 20,
    onError: (err) => {
      console.error("Erreur dans usePostDetail:", err);
    },
  });

  // Redirection si l'article n'existe pas
  useEffect(() => {
    if (!isLoading && !post && !isError) {
      toast.error("Article non trouvé");
      router.push("/blog");
    }
  }, [post, isLoading, router, isError]);

  // Adaptation des données pour l'UI ArticleView
  const adaptedPost = useMemo(() => {
    if (!post) return null;

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
      likesCount: likesCount,
      tags: post.tags.map((tag) => tag.name).filter(Boolean),
    };
  }, [post, author, likesCount]);

  // Adaptation des commentaires pour l'UI
  const adaptedComments = useMemo(() => {
    if (!comments) return [];
    return comments.map((comment) => ({
      id: comment.id,
      text: comment.content,
      authorName:
        [comment.author.firstName, comment.author.lastName]
          .filter(Boolean)
          .join(" ") || comment.author.username,
      authorAvatar:
        comment.author.avatar ||
        `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(comment.author.username?.[0] || "U")}`,
      postId: post?.id || "",
      approved: true,
      createdAt: comment.createdAt,
    }));
  }, [comments, post?.id]);

  // ✅ CORRECTION: Créer des tableaux typés string[] sans undefined
  const likedPosts: string[] = useMemo(() => {
    if (isLiked && post) {
      return [post.id];
    }
    return [];
  }, [isLiked, post]);

  const savedPosts: string[] = useMemo(() => {
    if (isBookmarked && post) {
      return [post.id];
    }
    return [];
  }, [isBookmarked, post]);

  // Gestionnaire de soumission de commentaire
  const handleCommentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    // Si l'utilisateur n'est pas connecté, utiliser le nom saisi
    if (!canInteract) {
      toast.error("Connectez-vous pour commenter");
      router.push("/login");
      return;
    }

    const result = await submitComment(commentText);
    if (result) {
      setCommentText("");
      setCommentAuthor("");
    }
  };

  // Gestionnaire pour le like
  const handleLikePost = async (postId: string) => {
    await toggleLike();
  };

  // Gestionnaire pour la sauvegarde
  const handleSavePost = (postId: string) => {
    toggleBookmark();
  };

  // Gestionnaire pour les réactions
  const handleToggleReaction = (postId: string, reactionId: string) => {
    // Implémentation pour les réactions si nécessaire
  };

  // Gestionnaire pour changer la vue
  const setActiveView = (view: "feed" | "article" | "author" | "admin") => {
    if (view === "feed") {
      router.push("/blog");
    } else if (view === "author" && post) {
      router.push(`/blog/author/${post.authorId}`);
    }
  };

  // Gestionnaire pour sélectionner un auteur
  const setSelectedAuthorId = (id: string | null) => {
    if (id) {
      router.push(`/blog/author/${id}`);
    }
  };

  // Gestionnaire pour supprimer un commentaire
  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

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
        handleToggleReaction={handleToggleReaction}
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
