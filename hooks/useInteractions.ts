// hooks/useInteractions.ts
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-hot-toast";

export interface InteractionState {
  isLiked: boolean;
  isBookmarked: boolean;
  likesCount: number;
  bookmarksCount?: number;
}

export interface UseInteractionsOptions {
  targetId: string;
  targetType: "post" | "podcast" | "book" | "comment";
  authorId?: string;
  currentUserId?: string | null;
  initialLiked?: boolean;
  initialBookmarked?: boolean;
  initialLikesCount?: number;
  initialBookmarksCount?: number;
  onLikeToggle?: (isLiked: boolean) => void;
  onBookmarkToggle?: (isBookmarked: boolean) => void;
  onError?: (error: Error) => void;
}

export interface UseInteractionsReturn {
  isLiked: boolean;
  isBookmarked: boolean;
  likesCount: number;
  bookmarksCount: number;
  isLiking: boolean;
  isBookmarking: boolean;
  toggleLike: () => Promise<void>;
  toggleBookmark: () => Promise<void>;
  canInteract: boolean;
  isOwnContent: boolean;
}

// Helper pour exécuter une mutation d'interaction
async function performInteractionRequest(
  endpoint: string,
  body: Record<string, any>,
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Erreur lors de la requête");
  }
  return data;
}

export function useInteractions({
  targetId,
  targetType,
  authorId,
  currentUserId,
  initialLiked = false,
  initialBookmarked = false,
  initialLikesCount = 0,
  initialBookmarksCount = 0,
  onLikeToggle,
  onBookmarkToggle,
  onError,
}: UseInteractionsOptions): UseInteractionsReturn {
  const router = useRouter();

  // États
  const [isLiked, setIsLiked] = useState<boolean>(initialLiked);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialBookmarked);
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
  const [bookmarksCount, setBookmarksCount] = useState<number>(
    initialBookmarksCount,
  );

  // États de chargement
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isBookmarking, setIsBookmarking] = useState<boolean>(false);

  // Références pour les délais
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculs simples (pas de useMemo nécessaire)
  const canInteract = !!currentUserId;
  const isOwnContent = authorId === currentUserId;

  const handleAuthRedirect = useCallback(() => {
    router.push("/login");
    toast.error("Connectez-vous pour interagir");
  }, [router]);

  const handleError = useCallback(
    (error: Error, action: string) => {
      console.error(`Erreur lors de ${action}:`, error);
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
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        await performInteractionRequest("/api/interactions/like", {
          type: targetType,
          id: targetId,
        });

        onLikeToggle?.(newIsLiked);
        if (newIsLiked) toast.success("❤️ Aimé");
      } catch (error) {
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
        handleError(error as Error, "le like");
      } finally {
        setIsLiking(false);
        timeoutRef.current = null;
      }
    }, 300);
  }, [canInteract, isLiking, isLiked, likesCount, targetId, targetType, handleAuthRedirect, onLikeToggle, handleError]);

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
      setBookmarksCount((prev) => (newIsBookmarked ? prev + 1 : prev - 1));
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        await performInteractionRequest("/api/interactions/bookmark", {
          type: targetType,
          id: targetId,
        });

        onBookmarkToggle?.(newIsBookmarked);
        toast.success(
          newIsBookmarked ? "📑 Ajouté aux favoris" : "Retiré des favoris"
        );
      } catch (error) {
        setIsBookmarked(previousBookmarked);
        if (bookmarksCount !== undefined) {
          setBookmarksCount((prev) => (previousBookmarked ? prev + 1 : prev - 1));
        }
        handleError(error as Error, "le bookmark");
      } finally {
        setIsBookmarking(false);
        timeoutRef.current = null;
      }
    }, 300);
  }, [canInteract, isBookmarking, isBookmarked, bookmarksCount, targetId, targetType, handleAuthRedirect, onBookmarkToggle, handleError]);

  return {
    isLiked,
    isBookmarked,
    likesCount,
    bookmarksCount,
    isLiking,
    isBookmarking,
    toggleLike,
    toggleBookmark,
    canInteract,
    isOwnContent,
  };
}
