// hooks/blog/useSavedPosts.ts
"use client";

import { useAuthContext } from "@/contexts/auth/auth.context";
import { FeedItem, FeedResponse } from "@/lib/services/feed.service";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface UseSavedPostsOptions {
  initialPage?: number;
  limit?: number;
  onSuccess?: (data: FeedResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseSavedPostsReturn {
  // Données
  posts: FeedItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Pagination
  page: number;
  total: number;
  totalPages: number;
  hasMore: boolean;

  // Méthodes
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  removeSavedPost: (postId: string) => void;
  toggleSave: (postId: string) => Promise<void>;

  // États de chargement
  isLoadingMore: boolean;
  isRefreshing: boolean;
}

export function useSavedPosts(
  options: UseSavedPostsOptions = {},
): UseSavedPostsReturn {
  const { user, isAuthenticated } = useAuthContext();
  const { initialPage = 1, limit = 10, onSuccess, onError } = options;

  // États principaux
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isMounted = useRef(true);
  const abortController = useRef<AbortController | null>(null);
  const hasInitialLoaded = useRef(false);

  // Nettoyage
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  const checkAuth = useCallback(() => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Connectez-vous pour voir vos articles sauvegardés");
      return false;
    }
    return true;
  }, [isAuthenticated, user]);

  /**
   * Récupère les posts sauvegardés
   */
  const fetchSavedPosts = useCallback(
    async (pageToFetch: number) => {
      if (!checkAuth()) return;

      // Annuler la requête précédente
      if (abortController.current) {
        abortController.current.abort();
      }

      const controller = new AbortController();
      abortController.current = controller;

      const isFirstPage = pageToFetch === 1;
      setIsLoading(isFirstPage);
      setIsLoadingMore(!isFirstPage);
      setIsError(false);
      setError(null);

      try {
        const url = `/api/me/bookmarks?page=${pageToFetch}&limit=${limit}`;
        console.log(`📚 Chargement des sauvegardes: ${url}`);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Erreur lors du chargement des sauvegardes",
          );
        }

        const data = await response.json();

        if (!isMounted.current) return;

        // Transformer les données en FeedItems
        const feedItems = data.data.map((bookmark: any) => {
          const target = bookmark.post || bookmark.podcast || bookmark.book;
          return {
            post: {
              ...target,
              author: {
                id: target.authorId,
                username: target.author?.username || "unknown",
                firstName: target.author?.firstName || null,
                lastName: target.author?.lastName || null,
                avatar: target.author?.avatar || null,
              },
              category: target.category || null,
              tags: target.tags || [],
            },
            author: {
              id: target.authorId,
              username: target.author?.username || "unknown",
              firstName: target.author?.firstName || null,
              lastName: target.author?.lastName || null,
              avatar: target.author?.avatar || null,
              bio: target.author?.bio || null,
            },
            interactionState: {
              isLiked: false, // Sera mis à jour par un autre appel si nécessaire
              isBookmarked: true,
              isFollowing: false,
            },
            bookmarkId: bookmark.id,
          };
        });

        // Filtrer uniquement les posts (pas les podcasts ou livres pour ce feed)
        const postItems = feedItems.filter((item: any) => item.post.id);

        // Mettre à jour les states
        if (isFirstPage) {
          setPosts(postItems);
        } else {
          setPosts((prev) => [...prev, ...postItems]);
        }

        setPage(data.meta.page);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);

        if (onSuccess) {
          onSuccess(data);
        }

        console.log(`✅ ${postItems.length} sauvegardes chargées`);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("🛑 Requête annulée");
          return;
        }

        if (!isMounted.current) return;

        console.error("❌ Erreur lors du chargement des sauvegardes:", err);
        setIsError(true);
        setError(err);

        if (onError) {
          onError(err);
        }

        toast.error(err.message || "Erreur lors du chargement des sauvegardes");
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsRefreshing(false);
        }
        if (abortController.current === controller) {
          abortController.current = null;
        }
      }
    },
    [checkAuth, limit, onSuccess, onError],
  );

  // Computed values - Déclaré AVANT d'être utilisé
  const hasMore = page < totalPages;

  /**
   * Charger plus de sauvegardes (pagination infinie)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await fetchSavedPosts(page + 1);
  }, [hasMore, isLoadingMore, isLoading, page, fetchSavedPosts]);

  /**
   * Rafraîchir la liste
   */
  const refresh = useCallback(async () => {
    if (!checkAuth()) return;
    setIsRefreshing(true);
    await fetchSavedPosts(1);
  }, [checkAuth, fetchSavedPosts]);

  /**
   * Aller à une page spécifique
   */
  const goToPage = useCallback(
    async (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === page) return;
      await fetchSavedPosts(newPage);
    },
    [page, totalPages, fetchSavedPosts],
  );

  /**
   * Supprimer un post des sauvegardes (optimistic update)
   */
  const removeSavedPost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((item) => item.post.id !== postId));
    setTotal((prev) => prev - 1);
  }, []);

  /**
   * Toggle sauvegarde pour un post
   */
  const toggleSave = useCallback(
    async (postId: string) => {
      if (!checkAuth()) return;

      // Vérifier si le post est dans la liste
      const existingItem = posts.find((item) => item.post.id === postId);

      if (existingItem) {
        // Si le post est sauvegardé, on le retire
        try {
          // Appel API pour retirer des sauvegardes
          const response = await fetch("/api/interactions/bookmark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "post",
              id: postId,
            }),
          });

          if (!response.ok) {
            throw new Error("Erreur lors du retrait des sauvegardes");
          }

          // Optimistic update
          removeSavedPost(postId);
          toast.success("Retiré des favoris");
        } catch (err: any) {
          console.error("❌ Erreur toggleSave:", err);
          toast.error(err.message || "Erreur lors de la mise à jour");
        }
      } else {
        // Le post n'est pas dans la liste, on le sauvegarde
        toast.success("Article sauvegardé !"); // Changed from toast.info to toast.success
        // On pourrait ajouter une logique pour l'ajouter à la liste
        // mais il est préférable de rafraîchir la liste
        await refresh();
      }
    },
    [checkAuth, posts, removeSavedPost, refresh],
  );

  // Chargement initial
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      hasInitialLoaded.current = false;
      return;
    }

    if (hasInitialLoaded.current) return;

    hasInitialLoaded.current = true;
    void fetchSavedPosts(initialPage);
  }, [isAuthenticated, user?.id, fetchSavedPosts, initialPage]);

  return {
    // Données
    posts,
    isLoading,
    isError,
    error,

    // Pagination
    page,
    total,
    totalPages,
    hasMore,

    // Méthodes
    loadMore,
    refresh,
    goToPage,
    removeSavedPost,
    toggleSave,

    // États de chargement
    isLoadingMore,
    isRefreshing,
  };
}
