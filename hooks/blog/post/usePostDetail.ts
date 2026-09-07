// hooks/blog/usePostDetail.ts
"use client";

import { useAuthContext } from "@/contexts/auth/auth.context";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// Types pour les données du post
export interface PostAuthor {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  bio?: string | null;
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PostTag {
  id: string;
  name: string;
  slug: string;
}

export interface PostDetailData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  views: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  authorId: string;
  author: PostAuthor;
  category: PostCategory | null;
  tags: PostTag[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
  _count?: {
    replies: number;
  };
}

export interface UsePostDetailOptions {
  onPostLoaded?: (post: PostDetailData) => void;
  onError?: (error: Error) => void;
  fetchComments?: boolean;
  commentsLimit?: number;
}

export interface UsePostDetailReturn {
  // Données
  post: PostDetailData | null;
  author: PostAuthor | null;
  comments: CommentData[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // États des interactions
  isLiked: boolean;
  isBookmarked: boolean;
  likesCount: number;
  commentsCount: number;

  // États de chargement
  isLiking: boolean;
  isBookmarking: boolean;
  isSubmittingComment: boolean;
  isLoadingComments: boolean;

  // Méthodes
  fetchPost: (slug: string) => Promise<void>;
  fetchComments: (page?: number) => Promise<void>;
  toggleLike: () => Promise<void>;
  toggleBookmark: () => Promise<void>;
  submitComment: (content: string) => Promise<CommentData | null>;
  deleteComment: (commentId: string) => Promise<void>;
  reset: () => void;

  // Pagination des commentaires
  commentsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };

  // Autres
  canInteract: boolean;
  isOwnContent: boolean;
  reload: () => Promise<void>;
}

/**
 * Hook pour récupérer et gérer les détails d'un article
 *
 * @param slug - Slug de l'article à récupérer
 * @param options - Options de configuration
 * @returns Objet contenant les données et les méthodes de gestion
 */
export function usePostDetail(
  slug?: string,
  options: UsePostDetailOptions = {},
): UsePostDetailReturn {
  const {
    onPostLoaded,
    onError,
    fetchComments: initialFetchComments = true,
    commentsLimit = 10,
  } = options;

  const { user, isAuthenticated } = useAuthContext();

  // États principaux
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // États des interactions
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  // États de chargement des actions
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Pagination des commentaires
  const [commentsPagination, setCommentsPagination] = useState({
    page: 1,
    limit: commentsLimit,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  // Refs pour éviter les appels multiples
  const isMounted = useRef(true);
  const currentSlug = useRef<string | null>(null);
  const postId = useRef<string | null>(null);
  const hasInitialLoaded = useRef(false);
  const abortController = useRef<AbortController | null>(null);
  const isLoadingCommentsRef = useRef(false);
  const commentsFetchedForPost = useRef<string | null>(null);

  // Nettoyer les aborts
  useEffect(() => {
    // IMPORTANT: Réinitialiser les refs à chaque (re)montage.
    // En mode développement, React StrictMode monte → démonte → remonte le composant.
    // Les states sont réinitialisés par React, MAIS les refs persistent à travers ce cycle.
    // Sans ces réinitialisations :
    // 1. isMounted.current reste false après le démontage simulé → setPost jamais appelé
    //    et setIsLoading(false) jamais exécuté → page bloquée sur le skeleton.
    // 2. hasInitialLoaded.current restant true + currentSlug.match → l'effet [slug]
    //    skipperait le fetch au re-montage → même résultat.
    isMounted.current = true;
    hasInitialLoaded.current = false;
    currentSlug.current = null;

    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  /**
   * Réinitialise tous les états
   */
  const reset = useCallback(() => {
    setPost(null);
    setComments([]);
    setCommentsPagination({
      page: 1,
      limit: commentsLimit,
      total: 0,
      totalPages: 0,
      hasMore: false,
    });
    setIsLiked(false);
    setIsBookmarked(false);
    setLikesCount(0);
    setCommentsCount(0);
    setIsError(false);
    setError(null);
    currentSlug.current = null;
    postId.current = null;
    hasInitialLoaded.current = false;
  }, [commentsLimit]);

  /**
   * Récupère les détails d'un article
   */
  const fetchPost = useCallback(
    async (slugToFetch: string) => {
      console.log("[fetchPost] Appelé avec slug:", slugToFetch);

      if (!slugToFetch || !slugToFetch.trim()) {
        console.error("[fetchPost] Slug vide, arrêt");
        setIsLoading(false);
        setIsError(true);
        setError(new Error("Slug de l'article manquant"));
        return;
      }

      // Annuler la requête précédente si elle existe
      if (abortController.current) {
        abortController.current.abort();
      }

      const controller = new AbortController();
      abortController.current = controller;

      // Conserver l'ancien slug pour savoir si on change d'article
      const previousSlug = currentSlug.current;
      currentSlug.current = slugToFetch;

      // Réinitialiser si c'est un nouveau slug
      if (previousSlug && previousSlug !== slugToFetch) {
        reset();
      }

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const url = `/api/posts/${slugToFetch}`;
        console.log(`[fetchPost] URL construite: ${url}`);
        console.log(`📖 Chargement de l'article: ${slugToFetch}`);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Erreur ${response.status}: Article non trouvé`,
          );
        }

        const data = await response.json();

        if (!isMounted.current) return;

        // Mapper les données pour l'UI
        const postData = mapPostData(data);

        setPost(postData);
        setLikesCount(postData.likesCount);
        setCommentsCount(postData.commentsCount);
        setIsLiked(postData.isLiked || false);
        setIsBookmarked(postData.isBookmarked || false);
        postId.current = postData.id;

        // Callback de succès
        if (onPostLoaded) {
          onPostLoaded(postData);
        }

        console.log(`✅ Article chargé: ${postData.title}`);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("🛑 Requête annulée - Réinitialisation pour nouvel essai");
          // Réinitialiser pour permettre un nouvel essai au prochain render
          hasInitialLoaded.current = false;
          return;
        }

        if (!isMounted.current) return;

        console.error("❌ Erreur lors du chargement de l'article:", err);
        setIsError(true);
        setError(err);

        if (onError) {
          onError(err);
        }

        toast.error(err.message || "Erreur lors du chargement de l'article");
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
        if (abortController.current === controller) {
          abortController.current = null;
        }
      }
    },
    [reset, initialFetchComments, onPostLoaded, onError],
  );

  /**
   * Récupère les commentaires d'un article
   */
  const fetchComments = useCallback(
    async (page: number = 1, targetPostId?: string) => {
      const targetId = targetPostId || postId.current;

      if (!targetId) {
        console.warn("⚠️ Aucun postId disponible pour charger les commentaires");
        return;
      }

      if (isLoadingCommentsRef.current) return;

      isLoadingCommentsRef.current = true;
      setIsLoadingComments(true);

      try {
        const url = `/api/posts/${currentSlug.current}/comments?page=${page}&limit=${commentsLimit}`;
        console.log(`💬 Chargement des commentaires: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Erreur lors du chargement des commentaires",
          );
        }

        const data = await response.json();

        if (!isMounted.current) return;

        setComments((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
        setCommentsPagination({
          page: data.meta.page,
          limit: data.meta.limit,
          total: data.meta.total,
          totalPages: data.meta.totalPages,
          hasMore: data.meta.page < data.meta.totalPages,
        });
      } catch (err: any) {
        console.error("❌ Erreur lors du chargement des commentaires:", err);
        toast.error(err.message || "Erreur lors du chargement des commentaires");
      } finally {
        isLoadingCommentsRef.current = false;
        if (isMounted.current) {
          setIsLoadingComments(false);
        }
      }
    },
    [commentsLimit],
  );

  /**
   * Toggle Like - Appel à l'API générique
   */
  const toggleLike = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour aimer un article");
      return;
    }

    if (!postId.current) return;
    if (isLiking) return;

    setIsLiking(true);

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount((prev) => (!isLiked ? prev + 1 : prev - 1));

    try {
      const response = await fetch("/api/interactions/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "post",
          id: postId.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors du like");
      }

      const data = await response.json();
      // La réponse contient { liked: boolean }

      // Mettre à jour avec la valeur du serveur
      setIsLiked(data.liked);
      setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1));

      if (data.liked) {
        toast.success("❤️ Aimé");
      }
    } catch (err: any) {
      console.error("❌ Erreur toggleLike:", err);

      // Rollback
      setIsLiked(previousLiked);
      setLikesCount(previousCount);

      toast.error(err.message || "Erreur lors du like");
    } finally {
      setIsLiking(false);
    }
  }, [isAuthenticated, isLiked, likesCount, isLiking]);

  /**
   * Toggle Bookmark - Appel à l'API générique
   */
  const toggleBookmark = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour sauvegarder un article");
      return;
    }

    if (!postId.current) return;
    if (isBookmarking) return;

    setIsBookmarking(true);

    // Optimistic update
    const previousBookmarked = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      const response = await fetch("/api/interactions/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "post",
          id: postId.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors du bookmark");
      }

      const data = await response.json();
      setIsBookmarked(data.bookmarked);

      if (data.bookmarked) {
        toast.success("📑 Ajouté aux favoris");
      } else {
        toast.success("Retiré des favoris");
      }
    } catch (err: any) {
      console.error("❌ Erreur toggleBookmark:", err);

      // Rollback
      setIsBookmarked(previousBookmarked);

      toast.error(err.message || "Erreur lors du bookmark");
    } finally {
      setIsBookmarking(false);
    }
  }, [isAuthenticated, isBookmarked, isBookmarking]);

  /**
   * Soumettre un nouveau commentaire
   */
  const submitComment = useCallback(
    async (content: string): Promise<CommentData | null> => {
      if (!isAuthenticated) {
        toast.error("Connectez-vous pour commenter");
        return null;
      }

      if (!postId.current) {
        toast.error("Article non trouvé");
        return null;
      }

      if (!content || content.trim().length === 0) {
        toast.error("Le commentaire ne peut pas être vide");
        return null;
      }

      if (isSubmittingComment) return null;

      setIsSubmittingComment(true);

      try {
        const response = await fetch(`/api/posts/${currentSlug.current}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: content.trim() }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Erreur lors de la publication du commentaire",
          );
        }

        const newComment = await response.json();

        // Mettre à jour la liste des commentaires
        setComments((prev) => [newComment, ...prev]);
        setCommentsCount((prev) => prev + 1);

        toast.success("Commentaire publié avec succès");

        return newComment;
      } catch (err: any) {
        console.error("❌ Erreur submitComment:", err);
        toast.error(err.message || "Erreur lors de la publication du commentaire");
        return null;
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [isAuthenticated, isSubmittingComment],
  );

  /**
   * Supprimer un commentaire
   */
  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!isAuthenticated) {
        toast.error("Connectez-vous pour supprimer un commentaire");
        return;
      }

      // Vérifier que le commentaire appartient à l'utilisateur ou que l'utilisateur est admin
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) {
        toast.error("Commentaire non trouvé");
        return;
      }

      if (comment.authorId !== user?.id && user?.role !== "ADMIN") {
        toast.error("Vous n'êtes pas autorisé à supprimer ce commentaire");
        return;
      }

      try {
        const response = await fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Erreur lors de la suppression");
        }

        // Supprimer le commentaire de la liste
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentsCount((prev) => prev - 1);

        toast.success("Commentaire supprimé");
      } catch (err: any) {
        console.error("❌ Erreur deleteComment:", err);
        toast.error(err.message || "Erreur lors de la suppression du commentaire");
      }
    },
    [isAuthenticated, comments, user],
  );

  /**
   * Charger plus de commentaires
   */
  const loadMoreComments = useCallback(async () => {
    if (!commentsPagination.hasMore || isLoadingComments) return;
    await fetchComments(commentsPagination.page + 1);
  }, [
    commentsPagination.hasMore,
    commentsPagination.page,
    isLoadingComments,
    fetchComments,
  ]);

  /**
   * Recharger l'article
   */
  const reload = useCallback(async () => {
    if (currentSlug.current) {
      await fetchPost(currentSlug.current);
    }
  }, [fetchPost]);

  // Mapper les données du post pour l'UI
  const mapPostData = useCallback((data: any): PostDetailData => {
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      status: data.status,
      views: data.views || 0,
      likesCount: data.likesCount || 0,
      commentsCount: data.commentsCount || 0,
      bookmarksCount: data.bookmarksCount || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      publishedAt: data.publishedAt,
      authorId: data.authorId,
      author: {
        id: data.author.id,
        username: data.author.username,
        firstName: data.author.firstName,
        lastName: data.author.lastName,
        avatar: data.author.avatar,
        bio: data.author.bio,
      },
      category: data.category
        ? {
            id: data.category.id,
            name: data.category.name,
            slug: data.category.slug,
          }
        : null,
      tags:
        data.tags?.map((tag: any) => ({
          id: tag.id || tag.tagId,
          name: tag.name || tag.tag?.name,
          slug: tag.slug || tag.tag?.slug,
        })) || [],
      isLiked: data.isLiked || false,
      isBookmarked: data.isBookmarked || false,
    };
  }, []);

  // Effet pour charger l'article au montage ou quand le slug change
  useEffect(() => {
    console.log(
      "[usePostDetail Effect] Slug:",
      slug,
      "Already loaded:",
      hasInitialLoaded.current,
      "Current slug:",
      currentSlug.current,
    );

    if (!slug || !slug.trim()) {
      console.warn("[usePostDetail] Slug vide ou invalide, arrêt du chargement");
      setIsLoading(false);
      setIsError(true);
      setError(new Error("Slug de l'article manquant"));
      return;
    }

    if (hasInitialLoaded.current && currentSlug.current === slug) {
      console.log("[usePostDetail] Article déjà chargé, skip");
      return;
    }

    console.log("[usePostDetail] Déclenchement du fetch pour slug:", slug);
    hasInitialLoaded.current = true;
    void fetchPost(slug);
  }, [slug, fetchPost]);

  // Effet pour mettre à jour les commentaires quand l'article change
  useEffect(() => {
    if (post && initialFetchComments && commentsFetchedForPost.current !== post.id) {
      commentsFetchedForPost.current = post.id;
      void fetchComments(1, post.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, initialFetchComments]);

  // Computed values
  const canInteract = isAuthenticated;
  const isOwnContent = user?.id === post?.authorId;

  const author = post?.author || null;

  return {
    // Données
    post,
    author,
    comments,
    isLoading,
    isError,
    error,

    // États des interactions
    isLiked,
    isBookmarked,
    likesCount,
    commentsCount,

    // États de chargement
    isLiking,
    isBookmarking,
    isSubmittingComment,
    isLoadingComments,

    // Méthodes
    fetchPost,
    fetchComments,
    toggleLike,
    toggleBookmark,
    submitComment,
    deleteComment,
    reset,

    // Pagination des commentaires
    commentsPagination,

    // Autres
    canInteract,
    isOwnContent,
    reload,
  };
}

// Export du type pour faciliter l'utilisation
export type UsePostDetail = typeof usePostDetail;
