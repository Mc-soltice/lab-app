// hooks/blog/useAuthorPosts.ts
"use client";

import { useAuthContext } from "@/contexts/auth/auth.context";
import { authorProfileService } from "@/lib/services/author-profile.client";
import { FeedItem, FeedResponse } from "@/lib/services/feed.service";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface UseAuthorPostsOptions {
  initialPage?: number;
  limit?: number;
  username: string;
  onSuccess?: (data: FeedResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseAuthorPostsReturn {
  // Données
  posts: FeedItem[];
  author: FeedItem["author"] | null;
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
  toggleLike: (postId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
  toggleFollow: () => Promise<void>;

  // États des interactions
  isFollowing: boolean;
  isLiking: boolean;
  isBookmarking: boolean;
  isFollowingAction: boolean;

  // États de chargement
  isLoadingMore: boolean;
  isRefreshing: boolean;
}

export function useAuthorPosts(
  options: UseAuthorPostsOptions,
): UseAuthorPostsReturn {
  const { user, isAuthenticated } = useAuthContext();
  const { username, initialPage = 1, limit = 10, onSuccess, onError } = options;

  // États principaux
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [author, setAuthor] = useState<FeedItem["author"] | null>(null);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // États d'interaction
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isFollowingAction, setIsFollowingAction] = useState(false);

  // Refs pour éviter les re-rendus inutiles
  const isMounted = useRef(true);
  const abortController = useRef<AbortController | null>(null);
  const initialLoadDone = useRef(false);
  const currentUsername = useRef(username);

  // ✅ Computed values
  const hasMore = page < totalPages;

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
   * Récupère les posts d'un auteur
   */
  const fetchAuthorPosts = useCallback(
    async (pageToFetch: number, isInitialLoad: boolean = false) => {
      // Annuler la requête précédente
      if (abortController.current) {
        abortController.current.abort();
      }

      const controller = new AbortController();
      abortController.current = controller;

      const isFirstPage = pageToFetch === 1;

      // ✅ Éviter les mises à jour d'état inutiles
      if (isFirstPage && !isInitialLoad) {
        setIsLoading(true);
      }
      if (!isFirstPage) {
        setIsLoadingMore(true);
      }

      setIsError(false);
      setError(null);

      try {
        const [profileData, data] = isFirstPage
          ? await Promise.all([
              authorProfileService.getAuthorProfile(username),
              authorProfileService.getAuthorPosts(username, pageToFetch, limit),
            ])
          : [
              null,
              await authorProfileService.getAuthorPosts(
                username,
                pageToFetch,
                limit,
              ),
            ];

        if (!isMounted.current) return;

        // Transformer les données en FeedItems
        const feedItems = data.data.map((post: any) => {
          const postAuthor = post.author || {
            id: post.authorId,
            username: "unknown",
            firstName: null,
            lastName: null,
            avatar: null,
          };

          return {
            post: {
              ...post,
              author: {
                id: postAuthor.id,
                username: postAuthor.username,
                firstName: postAuthor.firstName,
                lastName: postAuthor.lastName,
                avatar: postAuthor.avatar,
              },
              category: post.category || null,
              tags: post.tags || [],
            },
            author: {
              id: postAuthor.id,
              username: postAuthor.username,
              firstName: postAuthor.firstName,
              lastName: postAuthor.lastName,
              avatar: postAuthor.avatar,
              bio: postAuthor.bio || null,
              postsCount:
                post._count?.posts || data.meta?.authorPostsCount || 0,
              followersCount: post._count?.followers || 0,
              followingCount: post._count?.following || 0,
            },
            interactionState: {
              isLiked: post.isLiked || false,
              isBookmarked: post.isBookmarked || false,
              isFollowing: post.isFollowing || false,
            },
          };
        });

        // ✅ Mettre à jour les states en un seul batch
        if (isFirstPage) {
          setPosts(feedItems);

          if (profileData) {
            setAuthor({
              id: profileData.id,
              username: profileData.username,
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              avatar: profileData.avatar,
              bio: profileData.bio || null,
              postsCount: (profileData as any).postsCount || 0,
              followersCount: (profileData as any).followersCount || 0,
              followingCount: (profileData as any).followingCount || 0,
            });
          } else if (feedItems.length > 0) {
            setAuthor(feedItems[0].author);
            setIsFollowing(feedItems[0].interactionState?.isFollowing || false);
          } else {
            setAuthor(null);
            setIsFollowing(false);
          }
        } else {
          setPosts((prev) => [...prev, ...feedItems]);
        }

        setPage(data.meta.page);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);

        if (onSuccess) {
          onSuccess(data);
        }

        console.log(`✅ ${feedItems.length} posts de ${username} chargés`);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("🛑 Requête annulée");
          return;
        }

        if (!isMounted.current) return;

        console.error(
          `❌ Erreur lors du chargement des posts de ${username}:`,
          err,
        );
        setIsError(true);
        setError(err);

        if (onError) {
          onError(err);
        }

        toast.error(err.message || "Erreur lors du chargement des posts");
      } finally {
        if (isMounted.current) {
          // ✅ Réduire les mises à jour d'état en cascade
          if (isFirstPage) {
            setIsLoading(false);
          }
          setIsLoadingMore(false);
          setIsRefreshing(false);
        }
        if (abortController.current === controller) {
          abortController.current = null;
        }
      }
    },
    [username, limit, onSuccess, onError],
  );

  /**
   * Charger plus de posts
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await fetchAuthorPosts(page + 1);
  }, [hasMore, isLoadingMore, isLoading, page, fetchAuthorPosts]);

  /**
   * Rafraîchir la liste
   */
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAuthorPosts(1);
  }, [fetchAuthorPosts]);

  /**
   * Aller à une page spécifique
   */
  const goToPage = useCallback(
    async (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === page) return;
      await fetchAuthorPosts(newPage);
    },
    [page, totalPages, fetchAuthorPosts],
  );

  /**
   * Toggle Like pour un post
   */
  const toggleLike = useCallback(
    async (postId: string) => {
      if (!isAuthenticated) {
        toast.error("Connectez-vous pour aimer un article");
        return;
      }

      if (isLiking) return;
      setIsLiking(true);

      const postIndex = posts.findIndex((item) => item.post.id === postId);
      if (postIndex === -1) {
        setIsLiking(false);
        return;
      }

      const currentItem = posts[postIndex];
      const isCurrentlyLiked = currentItem.interactionState?.isLiked || false;
      const newIsLiked = !isCurrentlyLiked;

      // Optimistic update
      const updatedPosts = [...posts];
      updatedPosts[postIndex] = {
        ...currentItem,
        interactionState: {
          ...currentItem.interactionState!,
          isLiked: newIsLiked,
        },
        post: {
          ...currentItem.post,
          likesCount: newIsLiked
            ? (currentItem.post.likesCount || 0) + 1
            : (currentItem.post.likesCount || 0) - 1,
        },
      };
      setPosts(updatedPosts);

      try {
        const data = await authorProfileService.toggleLike(postId);

        // Mettre à jour avec la valeur du serveur
        updatedPosts[postIndex] = {
          ...currentItem,
          interactionState: {
            ...currentItem.interactionState!,
            isLiked: data.liked,
          },
          post: {
            ...currentItem.post,
            likesCount: data.liked
              ? (currentItem.post.likesCount || 0) + 1
              : (currentItem.post.likesCount || 0) - 1,
          },
        };
        setPosts(updatedPosts);
      } catch (err: any) {
        console.error("❌ Erreur toggleLike:", err);
        // Rollback
        setPosts(posts);
        toast.error(err.message || "Erreur lors du like");
      } finally {
        setIsLiking(false);
      }
    },
    [isAuthenticated, isLiking, posts],
  );

  /**
   * Toggle Bookmark pour un post
   */
  const toggleBookmark = useCallback(
    async (postId: string) => {
      if (!isAuthenticated) {
        toast.error("Connectez-vous pour sauvegarder un article");
        return;
      }

      if (isBookmarking) return;
      setIsBookmarking(true);

      const postIndex = posts.findIndex((item) => item.post.id === postId);
      if (postIndex === -1) {
        setIsBookmarking(false);
        return;
      }

      const currentItem = posts[postIndex];
      const isCurrentlyBookmarked =
        currentItem.interactionState?.isBookmarked || false;
      const newIsBookmarked = !isCurrentlyBookmarked;

      // Optimistic update
      const updatedPosts = [...posts];
      updatedPosts[postIndex] = {
        ...currentItem,
        interactionState: {
          ...currentItem.interactionState!,
          isBookmarked: newIsBookmarked,
        },
      };
      setPosts(updatedPosts);

      try {
        const data = await authorProfileService.toggleBookmark(postId);

        updatedPosts[postIndex] = {
          ...currentItem,
          interactionState: {
            ...currentItem.interactionState!,
            isBookmarked: data.bookmarked,
          },
        };
        setPosts(updatedPosts);

        toast.success(
          data.bookmarked ? "📑 Ajouté aux favoris" : "Retiré des favoris",
        );
      } catch (err: any) {
        console.error("❌ Erreur toggleBookmark:", err);
        setPosts(posts);
        toast.error(err.message || "Erreur lors du bookmark");
      } finally {
        setIsBookmarking(false);
      }
    },
    [isAuthenticated, isBookmarking, posts],
  );

  /**
   * Toggle Follow pour l'auteur
   */
  const toggleFollow = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour suivre un auteur");
      return;
    }

    if (isFollowingAction) return;
    setIsFollowingAction(true);

    const previousFollowing = isFollowing;
    const newIsFollowing = !isFollowing;

    // Optimistic update
    setIsFollowing(newIsFollowing);

    try {
      const data = await authorProfileService.toggleFollow(username);

      // Mettre à jour tous les posts avec le nouveau statut de follow
      setPosts((prev) =>
        prev.map((item) => ({
          ...item,
          interactionState: {
            ...item.interactionState!,
            isFollowing: data.following,
          },
        })),
      );

      toast.success(
        data.following
          ? `👤 Vous suivez maintenant ${username}`
          : `Vous ne suivez plus ${username}`,
      );
    } catch (err: any) {
      console.error("❌ Erreur toggleFollow:", err);
      setIsFollowing(previousFollowing);
      toast.error(err.message || "Erreur lors du follow");
    } finally {
      setIsFollowingAction(false);
    }
  }, [isAuthenticated, isFollowingAction, isFollowing, username]);

  // ✅ Chargement initial optimisé - Évite les re-rendus en cascade
  useEffect(() => {
    // Ne rien faire si le username est vide
    if (!username) return;

    // Réinitialiser si le username change
    if (currentUsername.current !== username) {
      currentUsername.current = username;
      initialLoadDone.current = false;
      // Réinitialiser les states
      setPosts([]);
      setAuthor(null);
      setPage(initialPage);
      setTotal(0);
      setTotalPages(0);
      setIsLoading(true);
      setIsError(false);
      setError(null);
    }

    // Éviter les doubles appels
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    // Charger les posts
    fetchAuthorPosts(initialPage, true);
  }, [username, initialPage, fetchAuthorPosts]);

  return {
    // Données
    posts,
    author,
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
    toggleLike,
    toggleBookmark,
    toggleFollow,

    // États des interactions
    isFollowing,
    isLiking,
    isBookmarking,
    isFollowingAction,

    // États de chargement
    isLoadingMore,
    isRefreshing,
  };
}
