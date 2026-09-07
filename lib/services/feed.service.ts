// lib/services/feed.service.ts
import { Post, User } from "@/prisma/generated/client";
import { NotFoundException } from "../exceptions";
import { prisma } from "../prisma/client";
import {
  BookmarkRepository,
  BookmarkWithRelations,
} from "../repositories/bookmark.repository";
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
  };
  interactionState?: {
    isLiked: boolean;
    isBookmarked: boolean;
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

// Alias pour les bookmarks de type "post"
type BookmarkWithPost = BookmarkWithRelations;

export class FeedService {
  private postRepository = new PostRepository();
  private userRepository = new UserRepository();
  private likeRepository = new LikeRepository();
  private bookmarkRepository = new BookmarkRepository();

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

    // Préparer les IDs des posts et auteurs pour les requêtes parallèles
    const authorIds = [...new Set(posts.map((post: Post) => post.authorId))];
    const postIds = posts.map((post: Post) => post.id);

    // Récupérer les informations enrichies des auteurs
    const authors = await this.getAuthorsWithStats(authorIds);

    // Récupérer les interactions si un utilisateur est connecté
    let userLikes: Set<string> = new Set();
    let userBookmarks: Set<string> = new Set();

    if (userId) {
      // Exécuter les 2 requêtes d'interactions EN PARALLÈLE
      const [likes, bookmarks] = await Promise.all([
        this.likeRepository.findByUserAndPostIds(userId, postIds),
        this.bookmarkRepository.findByUserAndPostIds(userId, postIds),
      ]);

      userLikes = new Set(
        likes.map((like) => like.postId!).filter(Boolean) as string[],
      );
      userBookmarks = new Set(
        bookmarks
          .map((bookmark) => bookmark.postId!)
          .filter(Boolean) as string[],
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
        },
        ...(userId && {
          interactionState: {
            isLiked: userLikes.has(post.id),
            isBookmarked: userBookmarks.has(post.id),
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
    };

    // Préparer les IDs des posts et les interactions
    const postIds = posts.map((post: any) => post.id);
    let userLikes: Set<string> = new Set();
    let userBookmarks: Set<string> = new Set();

    if (userId) {
      // Exécuter les 2 requêtes d'interactions EN PARALLÈLE
      const [likes, bookmarks] = await Promise.all([
        this.likeRepository.findByUserAndPostIds(userId, postIds),
        this.bookmarkRepository.findByUserAndPostIds(userId, postIds),
      ]);

      userLikes = new Set(
        likes.map((like) => like.postId!).filter(Boolean) as string[],
      );
      userBookmarks = new Set(
        bookmarks
          .map((bookmark) => bookmark.postId!)
          .filter(Boolean) as string[],
      );
    }

    const feedItems: FeedItem[] = posts.map((post: any) => ({
      post,
      author,
      ...(userId && {
        interactionState: {
          isLiked: userLikes.has(post.id),
          isBookmarked: userBookmarks.has(post.id),
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

    if (userId) {
      // Exécuter les 2 requêtes d'interactions EN PARALLÈLE
      const [likes, bookmarks] = await Promise.all([
        this.likeRepository.findByUserAndPostIds(userId, postIds),
        this.bookmarkRepository.findByUserAndPostIds(userId, postIds),
      ]);

      userLikes = new Set(
        likes.map((like) => like.postId!).filter(Boolean) as string[],
      );
      userBookmarks = new Set(
        bookmarks
          .map((bookmark) => bookmark.postId!)
          .filter(Boolean) as string[],
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
        },
        ...(userId && {
          interactionState: {
            isLiked: userLikes.has(post.id),
            isBookmarked: userBookmarks.has(post.id),
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
    const orderedPosts = postIds
      .map((id) => posts.find((post) => post.id === id))
      .filter(
        (post): post is (typeof posts)[number] => post !== undefined,
      ) as PostWithRelations[];

    // Récupérer les statistiques des auteurs et interactions EN PARALLÈLE
    const authorIds = [...new Set(orderedPosts.map((post) => post.authorId))];
    const [authorsWithStats, userLikes] = await Promise.all([
      this.getAuthorsWithStats(authorIds),
      this.getUserLikes(userId, postIds),
    ]);

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
        },
        interactionState: {
          isLiked: userLikes.has(post.id),
          isBookmarked: true,
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
    };

    // Préparer les IDs des posts pour les interactions
    const postIds: string[] = posts.map((post: any) => post.id);
    let userLikes: Set<string> = new Set();
    let userBookmarks: Set<string> = new Set();

    if (currentUserId) {
      // Exécuter les 2 requêtes d'interactions EN PARALLÈLE
      const [likes, bookmarks] = await Promise.all([
        this.likeRepository.findByUserAndPostIds(currentUserId, postIds),
        this.bookmarkRepository.findByUserAndPostIds(currentUserId, postIds),
      ]);

      userLikes = new Set(
        likes.map((like) => like.postId!).filter(Boolean) as string[],
      );
      userBookmarks = new Set(
        bookmarks
          .map((bookmark) => bookmark.postId!)
          .filter(Boolean) as string[],
      );
    }

    const feedItems: FeedItem[] = posts.map((post: any) => ({
      post,
      author,
      ...(currentUserId && {
        interactionState: {
          isLiked: userLikes.has(post.id),
          isBookmarked: userBookmarks.has(post.id),
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

  private async getAuthorWithStats(userId: string): Promise<AuthorWithStats> {
    const author = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: true,
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
          },
        },
      },
    }) as Promise<AuthorWithStats[]>;
  }
}
