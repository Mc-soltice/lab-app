// hooks/blog/useFollowing.ts
"use client";

import { useAuthContext } from "@/contexts/auth/auth.context";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface FollowingAuthor {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean; // Toujours true pour la liste "following"
}

export interface UseFollowingOptions {
  username?: string; // Si non fourni, utilise l'utilisateur connecté
  initialPage?: number;
  limit?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseFollowingReturn {
  // Données
  authors: FollowingAuthor[];
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
  unfollow: (authorId: string) => Promise<void>;
  follow: (authorId: string) => Promise<void>;
  toggleFollow: (authorId: string) => Promise<void>;

  // États de chargement
  isLoadingMore: boolean;
  isRefreshing: boolean;
  isFollowingAction: boolean;
  followingActionId: string | null;
}

export function useFollowing(
  options: UseFollowingOptions = {},
): UseFollowingReturn {
  const { user, isAuthenticated } = useAuthContext();
  const { username, initialPage = 1, limit = 20, onSuccess, onError } = options;

  // Déterminer le nom d'utilisateur à utiliser
  const targetUsername = username || user?.username;

  // États principaux
  const [authors, setAuthors] = useState<FollowingAuthor[]>([]);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // États d'action
  const [isFollowingAction, setIsFollowingAction] = useState(false);
  const [followingActionId, setFollowingActionId] = useState<string | null>(
    null,
  );

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
      toast.error("Connectez-vous pour voir vos abonnements");
      return false;
    }
    return true;
  }, [isAuthenticated, user]);

  /**
   * Récupère la liste des auteurs suivis
   */
  const fetchFollowing = useCallback(
    async (pageToFetch: number) => {
      // Vérifier l'authentification
      if (!targetUsername) {
        if (isMounted.current) {
          setIsLoading(false);
          setError(new Error("Nom d'utilisateur non fourni"));
          setIsError(true);
        }
        return;
      }

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
        const url = `/api/users/${encodeURIComponent(targetUsername)}/following?page=${pageToFetch}&limit=${limit}`;
        console.log(`📋 Chargement des abonnements: ${url}`);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Erreur lors du chargement des abonnements",
          );
        }

        const data = await response.json();

        if (!isMounted.current) return;

        // Transformer les données en auteurs
        const followingAuthors: FollowingAuthor[] = data.data.map(
          (follow: any) => {
            const followedUser = follow.following || follow;
            return {
              id: followedUser.id,
              username: followedUser.username,
              firstName: followedUser.firstName,
              lastName: followedUser.lastName,
              avatar: followedUser.avatar,
              bio: followedUser.bio,
              followersCount: followedUser.followersCount || 0,
              followingCount: followedUser.followingCount || 0,
              postsCount: followedUser.postsCount || 0,
              isFollowing: true,
            };
          },
        );

        // Mettre à jour les states
        if (isFirstPage) {
          setAuthors(followingAuthors);
        } else {
          setAuthors((prev) => [...prev, ...followingAuthors]);
        }

        setPage(data.meta.page);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);

        if (onSuccess) {
          onSuccess(data);
        }

        console.log(`✅ ${followingAuthors.length} abonnements chargés`);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("🛑 Requête annulée");
          return;
        }

        if (!isMounted.current) return;

        console.error("❌ Erreur lors du chargement des abonnements:", err);
        setIsError(true);
        setError(err);

        if (onError) {
          onError(err);
        }

        toast.error(err.message || "Erreur lors du chargement des abonnements");
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
    [targetUsername, limit, onSuccess, onError],
  );

  // Computed values
  const hasMore = page < totalPages;

  /**
   * Charger plus d'abonnements (pagination infinie)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await fetchFollowing(page + 1);
  }, [hasMore, isLoadingMore, isLoading, page, fetchFollowing]);

  /**
   * Rafraîchir la liste
   */
  const refresh = useCallback(async () => {
    if (!targetUsername) return;
    setIsRefreshing(true);
    await fetchFollowing(1);
  }, [targetUsername, fetchFollowing]);

  /**
   * Aller à une page spécifique
   */
  const goToPage = useCallback(
    async (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === page) return;
      await fetchFollowing(newPage);
    },
    [page, totalPages, fetchFollowing],
  );

  /**
   * Retirer un auteur de la liste (optimistic update)
   */
  const removeAuthor = useCallback((authorId: string) => {
    setAuthors((prev) => prev.filter((author) => author.id !== authorId));
    setTotal((prev) => prev - 1);
  }, []);

  /**
   * Ajouter un auteur à la liste
   */
  const addAuthor = useCallback((author: FollowingAuthor) => {
    setAuthors((prev) => [author, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  /**
   * Toggle follow pour un auteur
   */
  const toggleFollow = useCallback(
    async (authorId: string) => {
      if (!checkAuth()) return;

      // Trouver l'auteur dans la liste
      const author = authors.find((a) => a.id === authorId);
      if (!author) {
        toast.error("Auteur non trouvé dans la liste");
        return;
      }

      if (isFollowingAction && followingActionId === authorId) return;

      setIsFollowingAction(true);
      setFollowingActionId(authorId);

      const isCurrentlyFollowing = author.isFollowing ?? true;
      const newIsFollowing = !isCurrentlyFollowing;

      // Optimistic update
      if (newIsFollowing) {
        // Ajouter à la liste (ne devrait pas arriver car on est dans la liste "following")
        addAuthor({ ...author, isFollowing: true });
      } else {
        // Retirer de la liste
        removeAuthor(authorId);
      }

      try {
        const response = await fetch(
          `/api/users/${encodeURIComponent(author.username)}/follow`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Erreur lors du follow");
        }

        const data = await response.json();

        if (data.following) {
          toast.success(`👤 Vous suivez maintenant ${author.username}`);
        } else {
          toast.success(`Vous ne suivez plus ${author.username}`);
        }
      } catch (err: any) {
        console.error("❌ Erreur toggleFollow:", err);

        // Rollback : remettre l'auteur si on l'a retiré
        if (!newIsFollowing) {
          setAuthors((prev) => [author, ...prev]);
          setTotal((prev) => prev + 1);
        } else {
          removeAuthor(authorId);
        }

        toast.error(err.message || "Erreur lors du follow");
      } finally {
        setIsFollowingAction(false);
        setFollowingActionId(null);
      }
    },
    [
      checkAuth,
      authors,
      isFollowingAction,
      followingActionId,
      addAuthor,
      removeAuthor,
    ],
  );

  /**
   * Suivre un auteur (alias)
   */
  const follow = useCallback(
    async (authorId: string) => {
      const author = authors.find((a) => a.id === authorId);
      if (author && author.isFollowing) {
        toast.info("Vous suivez déjà cet auteur");
        return;
      }
      await toggleFollow(authorId);
    },
    [authors, toggleFollow],
  );

  /**
   * Ne plus suivre un auteur (alias)
   */
  const unfollow = useCallback(
    async (authorId: string) => {
      await toggleFollow(authorId);
    },
    [toggleFollow],
  );

  // Chargement initial
  useEffect(() => {
    if (!targetUsername) {
      hasInitialLoaded.current = false;
      setIsLoading(false);
      return;
    }

    if (hasInitialLoaded.current) return;

    hasInitialLoaded.current = true;
    void fetchFollowing(initialPage);
  }, [targetUsername, fetchFollowing, initialPage]);

  return {
    // Données
    authors,
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
    unfollow,
    follow,
    toggleFollow,

    // États de chargement
    isLoadingMore,
    isRefreshing,
    isFollowingAction,
    followingActionId,
  };
}
