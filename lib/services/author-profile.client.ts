export interface AuthorProfilePostItem {
  post: {
    id: string;
    title: string;
    category?: string | null;
    coverImage?: string | null;
    status?: string;
    publishedAt?: string | Date | null;
    readTime?: string | null;
    likeCount?: number | null;
    likesCount?: number | null;
    author?: {
      id: string;
      username: string;
      firstName: string | null;
      lastName: string | null;
      avatar: string | null;
    };
    [key: string]: unknown;
  };
  author: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    bio: string | null;
    postsCount?: number;
    followersCount?: number;
    followingCount?: number;
  };
  interactionState?: {
    isLiked: boolean;
    isBookmarked: boolean;
    isFollowing: boolean;
  };
}

export interface AuthorProfilePostsResponse {
  data: AuthorProfilePostItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      (data as { message?: string; error?: string }).message ||
        (data as { message?: string; error?: string }).error ||
        "Erreur réseau",
    );
  }
  return data as T;
};

export const authorProfileService = {
  async getAuthorProfile(username: string) {
    const response = await fetch(`/api/users/${encodeURIComponent(username)}`, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    return parseJson<AuthorProfilePostItem["author"]>(response);
  },

  async getAuthorPosts(username: string, page = 1, limit = 10) {
    const response = await fetch(
      `/api/users/${encodeURIComponent(username)}/posts?page=${page}&limit=${limit}`,
      {
        headers: {
          "Cache-Control": "no-cache",
        },
      },
    );
    return parseJson<AuthorProfilePostsResponse>(response);
  },

  async toggleLike(postId: string) {
    const response = await fetch("/api/interactions/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "post", id: postId }),
    });
    return parseJson<{ liked: boolean }>(response);
  },

  async toggleBookmark(postId: string) {
    const response = await fetch("/api/interactions/bookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "post", id: postId }),
    });
    return parseJson<{ bookmarked: boolean }>(response);
  },

  async toggleFollow(username: string) {
    const response = await fetch(
      `/api/users/${encodeURIComponent(username)}/follow`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );
    return parseJson<{ following: boolean }>(response);
  },
};
