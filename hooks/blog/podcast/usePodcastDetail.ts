"use client";

import { useAuthContext } from "@/contexts/auth/auth.context";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface PodcastAuthor {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  bio?: string | null;
}

export interface PodcastCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PodcastTag {
  id: string;
  name: string;
  slug: string;
}

export interface PodcastDetailData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content?: string | null;
  audioUrl: string;
  mediaType?: "AUDIO" | "VIDEO";
  coverImage: string | null;
  duration: number;
  transcript: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  plays: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  authorId: string;
  author: PodcastAuthor;
  category: PodcastCategory | null;
  tags: PodcastTag[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface PodcastCommentData {
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
}

export interface UsePodcastDetailOptions {
  onPodcastLoaded?: (podcast: PodcastDetailData) => void;
  onError?: (error: Error) => void;
  fetchComments?: boolean;
  commentsLimit?: number;
}

export interface UsePodcastDetailReturn {
  podcast: PodcastDetailData | null;
  author: PodcastAuthor | null;
  comments: PodcastCommentData[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isLiked: boolean;
  isBookmarked: boolean;
  likesCount: number;
  commentsCount: number;
  isLiking: boolean;
  isBookmarking: boolean;
  isSubmittingComment: boolean;
  isLoadingComments: boolean;
  fetchPodcast: (slug: string) => Promise<void>;
  fetchComments: (page?: number) => Promise<void>;
  toggleLike: () => Promise<void>;
  toggleBookmark: () => Promise<void>;
  submitComment: (content: string) => Promise<PodcastCommentData | null>;
  deleteComment: (commentId: string) => Promise<void>;
  reset: () => void;
  commentsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  canInteract: boolean;
  isOwnContent: boolean;
  reload: () => Promise<void>;
}

export function usePodcastDetail(
  slug?: string,
  options: UsePodcastDetailOptions = {},
): UsePodcastDetailReturn {
  const {
    onPodcastLoaded,
    onError,
    fetchComments: initialFetchComments = true,
    commentsLimit = 10,
  } = options;

  const { user, isAuthenticated } = useAuthContext();

  const [podcast, setPodcast] = useState<PodcastDetailData | null>(null);
  const [comments, setComments] = useState<PodcastCommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const [commentsPagination, setCommentsPagination] = useState({
    page: 1,
    limit: commentsLimit,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  const isMounted = useRef(true);
  const currentSlug = useRef<string | null>(null);
  const podcastId = useRef<string | null>(null);
  const hasInitialLoaded = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      abortController.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    setPodcast(null);
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
    podcastId.current = null;
    hasInitialLoaded.current = false;
  }, [commentsLimit]);

  const fetchPodcast = useCallback(
    async (slugToFetch: string) => {
      abortController.current?.abort();

      const controller = new AbortController();
      abortController.current = controller;
      const previousSlug = currentSlug.current;
      currentSlug.current = slugToFetch;

      if (previousSlug && previousSlug !== slugToFetch) {
        reset();
      }

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const response = await fetch(`/api/podcasts/${slugToFetch}`, {
          signal: controller.signal,
          headers: { "Cache-Control": "no-cache" },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Erreur ${response.status}: Podcast non trouvé`,
          );
        }

        const data = await response.json();
        if (!isMounted.current) return;

        const podcastData = mapPodcastData(data);
        setPodcast(podcastData);
        setLikesCount(podcastData.likesCount);
        setCommentsCount(podcastData.commentsCount);
        setIsLiked(podcastData.isLiked || false);
        setIsBookmarked(podcastData.isBookmarked || false);
        podcastId.current = podcastData.id;

        if (initialFetchComments && podcastData.id) {
          await fetchComments(1, podcastData.id);
        }

        onPodcastLoaded?.(podcastData);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        if (!isMounted.current) return;
        console.error("Erreur lors du chargement du podcast:", err);
        setIsError(true);
        setError(err);
        onError?.(err);
        toast.error(err.message || "Erreur lors du chargement du podcast");
      } finally {
        if (isMounted.current) setIsLoading(false);
        if (abortController.current === controller) abortController.current = null;
      }
    },
    [initialFetchComments, onError, onPodcastLoaded, reset],
  );

  const fetchComments = useCallback(
    async (page: number = 1, targetPodcastId?: string) => {
      const targetId = targetPodcastId || podcastId.current;
      if (!targetId) return;
      if (isLoadingComments) return;

      setIsLoadingComments(true);

      try {
        const url = `/api/podcasts/${currentSlug.current}/comments?page=${page}&limit=${commentsLimit}`;
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
        console.error("Erreur lors du chargement des commentaires:", err);
        toast.error(err.message || "Erreur lors du chargement des commentaires");
      } finally {
        if (isMounted.current) setIsLoadingComments(false);
      }
    },
    [commentsLimit, isLoadingComments],
  );

  const toggleLike = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour aimer ce podcast");
      return;
    }
    if (!podcastId.current || isLiking) return;

    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount((prev) => (!isLiked ? prev + 1 : prev - 1));

    try {
      const response = await fetch(`/api/podcasts/${currentSlug.current}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors du like");
      }

      const data = await response.json();
      setIsLiked(data.liked);
      setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch (err: any) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error(err.message || "Erreur lors du like");
    } finally {
      setIsLiking(false);
    }
  }, [isAuthenticated, isLiked, isLiking, likesCount]);

  const toggleBookmark = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour sauvegarder ce podcast");
      return;
    }
    if (!podcastId.current || isBookmarking) return;

    setIsBookmarking(true);
    const previousBookmarked = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      const response = await fetch(`/api/podcasts/${currentSlug.current}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors du bookmark");
      }

      const data = await response.json();
      setIsBookmarked(data.bookmarked);
    } catch (err: any) {
      setIsBookmarked(previousBookmarked);
      toast.error(err.message || "Erreur lors du bookmark");
    } finally {
      setIsBookmarking(false);
    }
  }, [isAuthenticated, isBookmarked, isBookmarking]);

  const submitComment = useCallback(
    async (content: string): Promise<PodcastCommentData | null> => {
      if (!isAuthenticated) {
        toast.error("Connectez-vous pour commenter");
        return null;
      }
      if (!podcastId.current) {
        toast.error("Podcast non trouvé");
        return null;
      }
      if (!content?.trim()) {
        toast.error("Le commentaire ne peut pas être vide");
        return null;
      }
      if (isSubmittingComment) return null;

      setIsSubmittingComment(true);
      try {
        const response = await fetch(`/api/podcasts/${currentSlug.current}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim() }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Erreur lors de la publication du commentaire",
          );
        }

        const newComment = await response.json();
        setComments((prev) => [newComment, ...prev]);
        setCommentsCount((prev) => prev + 1);
        toast.success("Commentaire publié avec succès");
        return newComment;
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de la publication du commentaire");
        return null;
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [isAuthenticated, isSubmittingComment],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!isAuthenticated) {
        toast.error("Connectez-vous pour supprimer un commentaire");
        return;
      }

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
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentsCount((prev) => prev - 1);
        toast.success("Commentaire supprimé");
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de la suppression du commentaire");
      }
    },
    [comments, isAuthenticated, user?.id, user?.role],
  );

  const reload = useCallback(async () => {
    if (currentSlug.current) {
      await fetchPodcast(currentSlug.current);
    }
  }, [fetchPodcast]);

  const mapPodcastData = useCallback(
    (data: any): PodcastDetailData => ({
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: data.transcript || data.description,
      audioUrl: data.audioUrl,
      coverImage: data.coverImage,
      duration: data.duration,
      transcript: data.transcript,
      status: data.status,
      plays: data.plays || 0,
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
    }),
    [],
  );

  useEffect(() => {
    if (!slug) return;
    if (hasInitialLoaded.current && currentSlug.current === slug) return;

    hasInitialLoaded.current = true;
    void fetchPodcast(slug);
  }, [slug, fetchPodcast]);

  useEffect(() => {
    if (podcast && initialFetchComments) {
      void fetchComments(1, podcast.id);
    }
  }, [podcast, initialFetchComments, fetchComments]);

  const canInteract = isAuthenticated;
  const isOwnContent = user?.id === podcast?.authorId;
  const author = podcast?.author || null;

  return {
    podcast,
    author,
    comments,
    isLoading,
    isError,
    error,
    isLiked,
    isBookmarked,
    likesCount,
    commentsCount,
    isLiking,
    isBookmarking,
    isSubmittingComment,
    isLoadingComments,
    fetchPodcast,
    fetchComments,
    toggleLike,
    toggleBookmark,
    submitComment,
    deleteComment,
    reset,
    commentsPagination,
    canInteract,
    isOwnContent,
    reload,
  };
}

export type UsePodcastDetail = typeof usePodcastDetail;
