import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export interface UseContentInteractionsOptions<TPost, TComment> {
  slug: string;
  detailHook: any;
  onNavigateToLogin?: () => void;
  buildAdaptedPost?: (post: TPost, author: any, likesCount: number) => any;
  buildAdaptedComments?: (comments: TComment[], postId?: string) => any[];
}

export function useContentInteractions<TPost, TComment>({
  slug,
  detailHook,
  onNavigateToLogin,
  buildAdaptedPost,
  buildAdaptedComments,
}: UseContentInteractionsOptions<TPost, TComment>) {
  const router = useRouter();
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");

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
    isSubmittingComment,
    toggleLike,
    toggleBookmark,
    submitComment,
    deleteComment,
    canInteract,
    reload,
  } = detailHook(slug, {
    fetchComments: true,
    commentsLimit: 20,
    onError: (err: unknown) => {
      console.error("Erreur dans detailHook:", err);
    },
  });

  // Adaptations de données - calcul direct sans useMemo (pas coûteux)
  const adaptedPost = buildAdaptedPost
    ? buildAdaptedPost(post, author, likesCount)
    : null;

  const adaptedComments = buildAdaptedComments
    ? buildAdaptedComments(comments, post?.id)
    : [];

  // Calculs triviaux - pas besoin de useMemo
  const likedPosts = isLiked && post ? [post.id] : [];
  const savedPosts = isBookmarked && post ? [post.id] : [];

  const handleCommentFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!commentText.trim()) {
        toast.error("Le commentaire ne peut pas être vide");
        return;
      }

      if (!canInteract) {
        toast.error("Connectez-vous pour commenter");
        onNavigateToLogin?.() || router.push("/login");
        return;
      }

      const result = await submitComment(commentText);
      if (result) {
        setCommentText("");
        setCommentAuthor("");
      }
    },
    [commentText, canInteract, submitComment, onNavigateToLogin, router],
  );

  const navigateToView = useCallback(
    (view: "feed" | "article" | "author" | "admin") => {
      if (view === "feed") {
        router.push("/blog");
      } else if (view === "author" && post) {
        router.push(`/blog/author/${post.authorId}`);
      }
    },
    [router, post],
  );

  const navigateToAuthor = useCallback(
    (authorId: string | null) => {
      if (authorId) {
        router.push(`/blog/author/${authorId}`);
      }
    },
    [router],
  );

  return {
    // État du commentaire
    commentAuthor,
    setCommentAuthor,
    commentText,
    setCommentText,
    
    // Données adaptées
    adaptedPost,
    adaptedComments,
    likedPosts,
    savedPosts,
    
    // État de chargement et erreurs
    isLoading,
    isError,
    error,
    isSubmittingComment,
    
    // Handlers - noms compatibles avec le code existant
    handleCommentFormSubmit,
    handleLikePost: toggleLike,
    handleSavePost: toggleBookmark,
    handleDeleteComment: deleteComment,
    
    // Handlers de navigation
    setActiveView: navigateToView,
    setSelectedAuthorId: navigateToAuthor,
    reload,
    
    // État
    canInteract,
  };
}
