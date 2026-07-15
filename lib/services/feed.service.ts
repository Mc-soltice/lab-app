// lib/services/feed.service.ts
import { Post, User } from "@/prisma/generated/client";
import { NotFoundException } from "../exceptions";
import { prisma } from "../prisma/client";
import { BookmarkRepository } from "../repositories/bookmark.repository";
import { FollowRepository } from "../repositories/follow.repository";
import { LikeRepository } from "../repositories/like.repository";
import { PostRepository } from "../repositories/post.repository";
import { UserRepository } from "../repositories/user.repository";

export interface FeedItem {
  post: Post & {
    author: {
      id: string;
      username: string;
      firstName: string | null;
      lastName: string | null;
      avatar: string | null;
    };
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    tags: Array<{
      tag: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
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
  bookmarkId?: string;
}

export interface FeedResponse {
  data: FeedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type AuthorWithStats = User & {
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
};

// Type pour les posts avec leurs relations
type PostWithRelations = Post & {
  author: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    bio: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
};

// Type pour les bookmarks avec leurs relations
type BookmarkWithPost = {
  id: string;
  createdAt: Date;
  postId: string | null;
  post: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    authorId: string;
  } | null;
};

export class FeedService {
  private postRepository = new PostRepository();
  private userRepository = new UserRepository();
  private likeRepository = new LikeRepository();
  private bookmarkRepository = new BookmarkRepository();
  private followRepository = new FollowRepository();

  async getMainFeed(
    userId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<FeedResponse> {
    // Validation des paramètres
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));

    const { data: posts, total } = await this.postRepository.getFeed(
      userId,
      validPage,
      validLimit,
    );

    if (posts.length === 0) {
      return {
        data: [],
        pagination: {
          page: validPage,
          limit: validLimit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Récupérer les informations enrichies des auteurs
    const authorIds = [...new Set(posts.map((post: Post) => post.authorId))];
    const authors = await this.getAuthorsWithStats(authorIds);

    // Préparer les IDs des posts pour les requêtes d'interactions
    const postIds = posts.map((post: Post) => post.id);

    // Récupérer les interactions si un utilisateur est connecté
    let userLikes: Set<string> = new Set();
    let userBookmarks: Set<string> = new Set();
    let userFollowing: Set<string> = new Set();

    if (userId) {
      // Récupérer tous les likes de l'utilisateur pour ces posts
      const likes = await this.likeRepository.findByUserAndPostIds(
        userId,
        postIds,
      );
      userLikes = new Set(
        likes.map((like) => like.postId!).filter(Boolean) as string[],
      );

      // Récupérer tous les bookmarks de l'utilisateur pour ces posts
      const bookmarks = await this.bookmarkRepository.findByUserAndPostIds(
        userId,
        postIds,
      );
      userBookmarks = new Set(
        bookmarks
          .map((bookmark) => bookmark.postId!)
          .filter(Boolean) as string[],
      );

      // Récupérer tous les follows de l'utilisateur
      const follows = await this.followRepository.findByFollowerAndAuthorIds(
        userId,
        authorIds,
      );
      userFollowing = new Set(
        follows.map((follow) => follow.followingId).filter(Boolean) as string[],
      );
    }

    const feedItems: FeedItem[] = posts.map((post: any) => {
      const author = authors.find(
        (a: AuthorWithStats) => a.id === post.authorId,
      );
      if (!author) {
        throw new NotFoundException(
          `Auteur non trouvé pour le post ${post.id}`,
        );
      }

      return {
        post,
        author: {
          id: author.id,
          username: author.username,
          firstName: author.firstName,
          lastName: author.lastName,
          avatar: author.avatar,
          bio: author.bio,
          postsCount: author._count?.posts || 0,
          followersCount: author._count?.followers || 0,
          followingCount: author._count?.following || 0,
        },
        ...(userId && {
          interactionState: {
            isLiked: userLikes.has(post.id),
            isBookmarked: userBookmarks.has(post.id),
            isFollowing: userFollowing.has(author.id),
          },
        }),
      };
    });

    const totalPages = Math.ceil(total / validLimit);

    return {
      data: feedItems,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Récupère le feed d'un utilisateur spécifique avec interactions
   */
  async getUserFeed(
    username: string,
    userId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<FeedResponse> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`Utilisateur ${username} non trouvé`);
    }

    const { data: posts, total } = await this.postRepository.findByAuthor(
      user.id,
      page,
      limit,
    );

    // Récupérer les statistiques de l'auteur
    const authorWithStats = await this.getAuthorWithStats(user.id);

    const author = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
      postsCount: authorWithStats._count?.posts || 0,
      followersCount: authorWithStats._count?.followers || 0,
      followingCount: authorWithStats._count?.following || 0,
    };

    // Préparer les IDs des posts et les interactions
    const postIds = posts.map((post: any) => post.id);
    let userLikes: Set<string> = new Set();
    let userBookmarks: Set<string> = new Set();
    let isFollowing = false;

    if (userId) {
      const likes = await this.likeRepository.findByUserAndPostIds(
        userId,
        postIds,
      );
      userLikes = new Set(
        likes.map((like) => like.postId!).filter(Boolean) as string[],
      );

      const bookmarks = await this.bookmarkRepository.findByUserAndPostIds(
        userId,
        postIds,
      );
      userBookmarks = new Set(
        bookmarks
          .map((bookmark) => bookmark.postId!)
          .filter(Boolean) as string[],
      );

      // Vérifier si l'utilisateur suit l'auteur
      isFollowing = await this.followRepository.exists(userId, user.id);
    }

    const feedItems: FeedItem[] = posts.map((post: any) => ({
      post,
      author,
      ...(userId && {
        interactionState: {
          isLiked: userLikes.has(post.id),
          isBookmarked: userBookmarks.has(post.id),
          isFollowing: isFollowing,
        },
      }),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: feedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Récupère le feed des articles populaires avec interactions
   */
  async getPopularFeed(
    userId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<FeedResponse> {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        skip,
        take: limit,
        orderBy: [
          { views: "desc" },
          { likesCount: "desc" },
          { commentsCount: "desc" },
        ],
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              bio: true,
            },
          },
          category: { select: { id: true, name: true, slug: true } },
          tags: {
            include: { tag: { select: { id: true, name: true, slug: true } } },
          },
        },
      }),
      prisma.post.count({
        where: { status: "PUBLISHED" },
      }),
    ]);

    // Récupérer les statistiques des auteurs
    const authorIds = [...new Set(posts.map((post: any) => post.authorId))];
    const authorsWithStats = await this.getAuthorsWithStats(authorIds);

    // Préparer les interactions
    const postIds = posts.map((post: any) => post.id);
    let userLikes: Set<string> = new Set();
    let userBookmarks: Set<string> = new Set();
    let userFollowing: Set<string> = new Set();

    if (userId) {
      const likes = await this.likeRepository.findByUserAndPostIds(
        userId,
        postIds,
      );
      userLikes = new Set(
        likes.map((like) => like.postId!).filter(Boolean) as string[],
      );

      const bookmarks = await this.bookmarkRepository.findByUserAndPostIds(
        userId,
        postIds,
      );
      userBookmarks = new Set(
        bookmarks
          .map((bookmark) => bookmark.postId!)
          .filter(Boolean) as string[],
      );

      const follows = await this.followRepository.findByFollowerAndAuthorIds(
        userId,
        authorIds,
      );
      userFollowing = new Set(
        follows.map((follow) => follow.followingId).filter(Boolean) as string[],
      );
    }

    const feedItems: FeedItem[] = posts.map((post: any) => {
      const authorWithStats = authorsWithStats.find(
        (a: AuthorWithStats) => a.id === post.authorId,
      );

      return {
        post,
        author: {
          id: post.author.id,
          username: post.author.username,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          avatar: post.author.avatar,
          bio: post.author.bio,
          postsCount: authorWithStats?._count?.posts || 0,
          followersCount: authorWithStats?._count?.followers || 0,
          followingCount: authorWithStats?._count?.following || 0,
        },
        ...(userId && {
          interactionState: {
            isLiked: userLikes.has(post.id),
            isBookmarked: userBookmarks.has(post.id),
            isFollowing: userFollowing.has(post.author.id),
          },
        }),
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: feedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Récupère le feed des articles sauvegardés par l'utilisateur
   */
  async getSavedFeed(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<FeedResponse> {
    // Validation
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));

    // Récupérer les bookmarks de l'utilisateur pour les posts
    const bookmarksResult = await this.bookmarkRepository.findByUser(
      userId,
      validPage,
      validLimit,
    );

    if (bookmarksResult.data.length === 0) {
      return {
        data: [],
        pagination: {
          page: validPage,
          limit: validLimit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Filtrer et typer les bookmarks de type "post"
    const postBookmarks = bookmarksResult.data.filter(
      (bookmark): bookmark is BookmarkWithPost =>
        bookmark.postId !== null && bookmark.post !== null,
    );

    if (postBookmarks.length === 0) {
      return {
        data: [],
        pagination: {
          page: validPage,
          limit: validLimit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Récupérer les IDs des posts - Correction avec typage explicite
    const postIds: string[] = postBookmarks
      .map((bookmark) => bookmark.postId)
      .filter((id): id is string => id !== null);

    // Récupérer les posts complets avec leurs relations
    const posts = await prisma.post.findMany({
      where: {
        id: { in: postIds },
        status: "PUBLISHED",
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    // Conserver l'ordre des bookmarks (les plus récents d'abord)
    const orderedPosts: PostWithRelations[] = postIds
      .map((id) => posts.find((post: PostWithRelations) => post.id === id))
      .filter((post): post is PostWithRelations => post !== undefined);

    // Récupérer les statistiques des auteurs
    const authorIds = [...new Set(orderedPosts.map((post) => post.authorId))];
    const authorsWithStats = await this.getAuthorsWithStats(authorIds);

    // Récupérer les interactions (likes, follow) pour chaque post
    const userLikes = await this.getUserLikes(userId, postIds);
    const userFollowing = await this.getUserFollowing(userId, authorIds);

    // Construire les FeedItems
    const feedItems: FeedItem[] = orderedPosts.map((post) => {
      const authorWithStats = authorsWithStats.find(
        (a: AuthorWithStats) => a.id === post.authorId,
      );
      const bookmark = postBookmarks.find((b) => b.postId === post.id);

      return {
        post: post as any,
        author: {
          id: post.author.id,
          username: post.author.username,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          avatar: post.author.avatar,
          bio: post.author.bio,
          postsCount: authorWithStats?._count?.posts || 0,
          followersCount: authorWithStats?._count?.followers || 0,
          followingCount: authorWithStats?._count?.following || 0,
        },
        interactionState: {
          isLiked: userLikes.has(post.id),
          isBookmarked: true,
          isFollowing: userFollowing.has(post.authorId),
        },
        bookmarkId: bookmark?.id,
      };
    });

    const totalPages = Math.ceil(bookmarksResult.total / validLimit);

    return {
      data: feedItems,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: bookmarksResult.total,
        totalPages,
      },
    };
  }

  /**
   * Récupère le feed des posts d'un auteur spécifique
   */
  async getAuthorFeed(
    username: string,
    currentUserId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<FeedResponse> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));

    // Récupérer l'utilisateur
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`Utilisateur ${username} non trouvé`);
    }

    // Récupérer les posts de l'auteur
    const { data: posts, total } = await this.postRepository.findByAuthor(
      user.id,
      validPage,
      validLimit,
    );

    if (posts.length === 0) {
      return {
        data: [],
        pagination: {
          page: validPage,
          limit: validLimit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Récupérer les statistiques de l'auteur
    const authorWithStats = await this.getAuthorWithStats(user.id);

    const author = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
      postsCount: authorWithStats._count?.posts || 0,
      followersCount: authorWithStats._count?.followers || 0,
      followingCount: authorWithStats._count?.following || 0,
    };

    // Préparer les IDs des posts pour les interactions
    const postIds: string[] = posts.map((post: any) => post.id);
    let userLikes: Set<string> = new Set();
    let userBookmarks: Set<string> = new Set();
    let isFollowing = false;

    if (currentUserId) {
      // Likes de l'utilisateur sur ces posts
      const likes = await this.likeRepository.findByUserAndPostIds(
        currentUserId,
        postIds,
      );
      userLikes = new Set(
        likes.map((like) => like.postId!).filter(Boolean) as string[],
      );

      // Bookmarks de l'utilisateur sur ces posts
      const bookmarks = await this.bookmarkRepository.findByUserAndPostIds(
        currentUserId,
        postIds,
      );
      userBookmarks = new Set(
        bookmarks
          .map((bookmark) => bookmark.postId!)
          .filter(Boolean) as string[],
      );

      // Vérifier si l'utilisateur suit l'auteur
      isFollowing = await this.followRepository.exists(currentUserId, user.id);
    }

    const feedItems: FeedItem[] = posts.map((post: any) => ({
      post,
      author,
      ...(currentUserId && {
        interactionState: {
          isLiked: userLikes.has(post.id),
          isBookmarked: userBookmarks.has(post.id),
          isFollowing,
        },
      }),
    }));

    const totalPages = Math.ceil(total / validLimit);

    return {
      data: feedItems,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
      },
    };
  }

  // ============================
  // MÉTHODES PRIVÉES UTILITAIRES
  // ============================

  private async getUserLikes(
    userId: string,
    postIds: string[],
  ): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();

    const likes = await this.likeRepository.findByUserAndPostIds(
      userId,
      postIds,
    );
    return new Set(
      likes.map((like) => like.postId!).filter(Boolean) as string[],
    );
  }

  private async getUserFollowing(
    userId: string,
    authorIds: string[],
  ): Promise<Set<string>> {
    if (authorIds.length === 0) return new Set();

    const follows = await this.followRepository.findByFollowerAndAuthorIds(
      userId,
      authorIds,
    );
    return new Set(
      follows.map((follow) => follow.followingId).filter(Boolean) as string[],
    );
  }

  private async getAuthorWithStats(userId: string): Promise<AuthorWithStats> {
    const author = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!author) {
      throw new NotFoundException(`Auteur ${userId} non trouvé`);
    }

    return author as AuthorWithStats;
  }

  private async getAuthorsWithStats(
    userIds: string[],
  ): Promise<AuthorWithStats[]> {
    if (userIds.length === 0) {
      return [];
    }

    return prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    }) as Promise<AuthorWithStats[]>;
  }
}
