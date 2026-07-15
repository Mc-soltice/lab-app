// hooks/blog/book/useBookDetail.ts
"use client";

import { useCallback, useEffect, useState } from "react";

interface UseBookDetailOptions {
  fetchComments?: boolean;
  commentsLimit?: number;
  onError?: (error: Error) => void;
}

export function useBookDetail(
  slug: string,
  options: UseBookDetailOptions = {},
) {
  const [book, setBook] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBook = useCallback(async () => {
    if (!slug) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await fetch(`/api/books/${slug}`);
      if (!response.ok) {
        throw new Error("Livre non trouvé");
      }

      const data = await response.json();
      setBook(data.book);
      setAuthor(data.author);

      if (options.fetchComments) {
        const commentsResponse = await fetch(
          `/api/books/${data.book.id}/comments?limit=${options.commentsLimit || 20}`,
        );
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData.data || []);
        }
      }
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      options.onError?.(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [slug, options]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const reload = useCallback(() => {
    fetchBook();
  }, [fetchBook]);

  return {
    book,
    author,
    comments,
    isLoading,
    isError,
    error,
    reload,
  };
}
