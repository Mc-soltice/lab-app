// hooks/useInteractions.ts
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-hot-toast";

export interface InteractionState {
  isLiked: boolean;
  isBookmarked: boolean;
  isFollowing: boolean;
  likesCount: number;
  bookmarksCount?: number;
}

export interface UseInteractionsOptions {
  targetId: string;
  targetType: "post" | "podcast" | "book" | "comment";
  authorId?: string;
  authorUsername?: string;
  currentUserId?: string | null;
  initialLiked?: boolean;
  initialBookmarked?: boolean;
  initialFollowing?: boolean;
  initialLikesCount?: number;
  initialBookmarksCount?: number;
  onLikeToggle?: (isLiked: boolean) => void;
  onBookmarkToggle?: (isBookmarked: boolean) => void;
  onFollowToggle?: (isFollowing: boolean) => void;
  onError?: (error: Error) => void;
}

export interface UseInteractionsReturn {
  isLiked: boolean;
  isBookmarked: boolean;
  isFollowing: boolean;
  likesCount: number;
  bookmarksCount: number;
  isLiking: boolean;
  isBookmarking: boolean;
  isFollowingAction: boolean;
  toggleLike: () => Promise<void>;
  toggleBookmark: () => Promise<void>;
  toggleFollow: () => Promise<void>;
  canInteract: boolean;
  canFollow: boolean;
  isOwnContent: boolean;
}

export function useInteractions({
  targetId,
  targetType,
  authorId,
  authorUsername,
  currentUserId,
  initialLiked = false,
  initialBookmarked = false,
  initialFollowing = false,
  initialLikesCount = 0,
  initialBookmarksCount = 0,
  onLikeToggle,
  onBookmarkToggle,
  onFollowToggle,
  onError,
}: UseInteractionsOptions): UseInteractionsReturn {
  const router = useRouter();

  const [isLiked, setIsLiked] = useState<boolean>(initialLiked);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialBookmarked);
  const [isFollowing, setIsFollowing] = useState<boolean>(initialFollowing);
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
  const [bookmarksCount, setBookmarksCount] = useState<number>(
    initialBookmarksCount,
  );

  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isBookmarking, setIsBookmarking] = useState<boolean>(false);
  const [isFollowingAction, setIsFollowingAction] = useState<boolean>(false);

  const likeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bookmarkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const followTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canInteract = !!currentUserId;
  const canFollow = !!currentUserId && authorId !== currentUserId;
  const isOwnContent = authorId === currentUserId;

  const handleAuthRedirect = useCallback(() => {
    router.push("/login");
    toast.error("Connectez-vous pour interagir");
  }, [router]);

  const handleError = useCallback(
    (error: Error, action: string) => {
      console.error(`Erreur lors de ${action}:`, error);
      toast.error(`Erreur lors de ${action}, veuillez réessayer`);
      onError?.(error);
    },
    [onError],
  );

  const toggleLike = useCallback(async () => {
    if (!canInteract) {
      handleAuthRedirect();
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const previousLiked = isLiked;
    const previousCount = likesCount;
    const newIsLiked = !isLiked;

    setIsLiked(newIsLiked);
    setLikesCount((prev: number) => (newIsLiked ? prev + 1 : prev - 1));

    if (likeTimeoutRef.current) {
      clearTimeout(likeTimeoutRef.current);
    }

    likeTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/interactions/like", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: targetType,
            id: targetId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Erreur lors du like");
        }

        onLikeToggle?.(newIsLiked);

        if (newIsLiked) {
          toast.success("❤️ Aimé");
        }
      } catch (error) {
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
        handleError(error as Error, "le like");
      } finally {
        setIsLiking(false);
        likeTimeoutRef.current = null;
      }
    }, 300);
  }, [
    canInteract,
    isLiking,
    isLiked,
    likesCount,
    targetId,
    targetType,
    currentUserId,
    handleAuthRedirect,
    onLikeToggle,
    handleError,
  ]);

  const toggleBookmark = useCallback(async () => {
    if (!canInteract) {
      handleAuthRedirect();
      return;
    }

    if (isBookmarking) return;
    setIsBookmarking(true);

    const previousBookmarked = isBookmarked;
    const newIsBookmarked = !isBookmarked;

    setIsBookmarked(newIsBookmarked);

    if (bookmarksCount !== undefined) {
      setBookmarksCount((prev: number) =>
        newIsBookmarked ? prev + 1 : prev - 1,
      );
    }

    if (bookmarkTimeoutRef.current) {
      clearTimeout(bookmarkTimeoutRef.current);
    }

    bookmarkTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/interactions/bookmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: targetType,
            id: targetId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Erreur lors du bookmark");
        }

        onBookmarkToggle?.(newIsBookmarked);
        toast.success(
          newIsBookmarked ? "📑 Ajouté aux favoris" : "Retiré des favoris",
        );
      } catch (error) {
        setIsBookmarked(previousBookmarked);
        if (bookmarksCount !== undefined) {
          setBookmarksCount((prev: number) =>
            previousBookmarked ? prev + 1 : prev - 1,
          );
        }
        handleError(error as Error, "le bookmark");
      } finally {
        setIsBookmarking(false);
        bookmarkTimeoutRef.current = null;
      }
    }, 300);
  }, [
    canInteract,
    isBookmarking,
    isBookmarked,
    bookmarksCount,
    targetId,
    targetType,
    currentUserId,
    handleAuthRedirect,
    onBookmarkToggle,
    handleError,
  ]);

  const toggleFollow = useCallback(async () => {
    if (!canInteract) {
      handleAuthRedirect();
      return;
    }

    if (!canFollow) {
      toast.error("Vous ne pouvez pas vous suivre vous-même");
      return;
    }

    if (isFollowingAction) return;
    setIsFollowingAction(true);

    const previousFollowing = isFollowing;
    const newIsFollowing = !isFollowing;

    // Optimistic update
    setIsFollowing(newIsFollowing);

    if (followTimeoutRef.current) {
      clearTimeout(followTimeoutRef.current);
    }

    followTimeoutRef.current = setTimeout(async () => {
      try {
        if (!authorUsername) {
          throw new Error("Nom d'utilisateur de l'auteur manquant");
        }

        const response = await fetch(
          `/api/users/${encodeURIComponent(authorUsername)}/follow`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        // Lire la réponse même en cas d'erreur
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors du follow");
        }

        onFollowToggle?.(newIsFollowing);

        toast.success(
          newIsFollowing
            ? `👤 Vous suivez maintenant ${authorUsername}`
            : `Vous ne suivez plus ${authorUsername}`,
        );
      } catch (error) {
        // Revenir à l'état précédent
        setIsFollowing(previousFollowing);

        const errorMessage =
          error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[Follow] Error:", error);
        toast.error(`Erreur : ${errorMessage}`);
        onError?.(error as Error);
      } finally {
        setIsFollowingAction(false);
        followTimeoutRef.current = null;
      }
    }, 300);
  }, [
    canInteract,
    canFollow,
    isFollowingAction,
    isFollowing,
    authorUsername,
    handleAuthRedirect,
    onFollowToggle,
    onError,
  ]);

  return {
    isLiked,
    isBookmarked,
    isFollowing,
    likesCount,
    bookmarksCount,
    isLiking,
    isBookmarking,
    isFollowingAction,
    toggleLike,
    toggleBookmark,
    toggleFollow,
    canInteract,
    canFollow,
    isOwnContent,
  };
}
