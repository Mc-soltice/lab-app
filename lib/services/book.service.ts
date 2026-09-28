// lib/services/book.service.ts
import type { Prisma } from "@/prisma/generated/client";
import type {
  BookServiceReadDto,
  BooksListResponseDto,
  CreateBookDto,
  UpdateBookDto,
} from "@/types/book";
import type { PostStatus } from "@/types/post";
import slugify from "slugify";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../exceptions";
import { BookRepository } from "../repositories/book.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { TagRepository } from "../repositories/tag.repository";
import { UserRepository } from "../repositories/user.repository";

export type BookWithRelations = BookServiceReadDto;
export type BooksListResponse = BooksListResponseDto;

export async function getBooks(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: PostStatus;
    userId?: string;
    sortBy?: "recent" | "popular" | "downloads" | "price";
    order?: "asc" | "desc";
    minPrice?: number;
    maxPrice?: number;
  } = {},
) {
  const bookService = new BookService();
  return bookService.getBooks(options);
}

export class BookService {
  private bookRepository = new BookRepository();
  private userRepository = new UserRepository();
  private categoryRepository = new CategoryRepository();
  private tagRepository = new TagRepository();

  /**
   * Créer un nouveau livre
   */
  async createBook(authorId: string, data: CreateBookDto): Promise<BookWithRelations> {
    // Vérifier l'utilisateur
    const user = await this.userRepository.findById(authorId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    // Vérifier la catégorie si fournie
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) throw new NotFoundException("Catégorie non trouvée");
    }

    // Générer le slug
    const slug = slugify(data.title, { lower: true, strict: true, trim: true });

    // Vérifier l'unicité du slug
    const existing = await this.bookRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException("Un livre avec ce titre existe déjà");
    }

    // Préparer les données
    const bookData = {
      title: data.title,
      slug,
      synopsis: data.synopsis || null,
      coverImage: data.coverImage || null,
      fileUrl: data.fileUrl || null,
      status: data.status || "DRAFT",
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      author: { connect: { id: authorId } },
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      tags: data.tags?.length
        ? {
            create: data.tags.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          }
        : undefined,
      ...(data.price !== undefined ? { price: data.price } : {}),
    } satisfies Prisma.BookCreateInput;

    // Créer le livre
    const book = await this.bookRepository.create(bookData);

    // Retourner le livre avec ses relations
    return this.getBookWithRelations(book.id);
  }

  /**
   * Récupérer un livre par son slug
   */
  async getBookBySlug(slug: string, userId?: string): Promise<BookWithRelations> {
    const book = await this.bookRepository.findBySlugWithRelations(slug);

    if (!book) {
      throw new NotFoundException("Livre non trouvé");
    }

    // Si le livre n'est pas publié et que l'utilisateur n'est pas l'auteur
    if (book.status !== "PUBLISHED") {
      if (!userId || book.authorId !== userId) {
        throw new NotFoundException("Livre non trouvé");
      }
    }

    // Récupérer les relations
    return this.getBookWithRelations(book.id, userId);
  }

  /**
   * Récupérer un livre par son ID
   */
  async getBookById(id: string, userId?: string): Promise<BookWithRelations> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundException("Livre non trouvé");
    }

    if (book.status !== "PUBLISHED" && (!userId || book.authorId !== userId)) {
      throw new NotFoundException("Livre non trouvé");
    }

    return this.getBookWithRelations(id, userId);
  }

  /**
   * Récupérer un livre avec ses relations
   */
  private async getBookWithRelations(
    id: string,
    userId?: string,
  ): Promise<BookWithRelations> {
    const book = await this.bookRepository.findByIdWithRelations(id);
    if (!book) {
      throw new NotFoundException("Livre non trouvé");
    }

    // Récupérer les statistiques
    const stats = await this.bookRepository.getStats(id);

    // Récupérer les interactions de l'utilisateur
    let interactionState = undefined;
    if (userId) {
      interactionState = await this.bookRepository.getUserInteractions(id, userId);
    }

    const normalizedBook: BookWithRelations = {
      ...book,
      tags: book.tags.map(({ tag }) => tag),
      price: book.price === null ? null : Number(book.price),
      likesCount: stats.likes,
      commentsCount: stats.comments,
      bookmarksCount: stats.bookmarks,
      interactionState,
    };

    return normalizedBook;
  }

  /**
   * Récupérer la liste des livres avec pagination et filtres
   */
  async getBooks(options: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: PostStatus;
    userId?: string;
    sortBy?: "recent" | "popular" | "downloads" | "price";
    order?: "asc" | "desc";
    minPrice?: number;
    maxPrice?: number;
  }): Promise<BooksListResponse> {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      status = "PUBLISHED",
      userId,
      sortBy = "recent",
      order = "desc",
      minPrice,
      maxPrice,
    } = options;

    const skip = (page - 1) * limit;

    // Construire la requête
    const where: Prisma.BookWhereInput = {
      status,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { synopsis: { contains: search } },
          { author: { username: { contains: search } } },
        ],
      }),
      ...(category && {
        category: { slug: category },
      }),
      ...(minPrice !== undefined && {
        price: { gte: minPrice },
      }),
      ...(maxPrice !== undefined && {
        price: { lte: maxPrice },
      }),
    };

    // Déterminer l'ordre
    let orderBy: Prisma.BookOrderByWithRelationInput = {};
    switch (sortBy) {
      case "recent":
      case "popular":
      case "downloads":
      case "price":
      default:
        orderBy = { publishedAt: order };
    }

    // Récupérer les livres
    const [books, total] = await Promise.all([
      this.bookRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      this.bookRepository.count(where),
    ]);

    // Formater les livres avec leurs statistiques
    const booksWithStats = await Promise.all(
      books.map(async (book) => {
        const stats = await this.bookRepository.getStats(book.id);
        let interactionState = undefined;
        if (userId) {
          interactionState = await this.bookRepository.getUserInteractions(
            book.id,
            userId,
          );
        }

        return {
          ...book,
          tags: book.tags.map(({ tag }) => tag),
          price: book.price === null ? null : Number(book.price),
          likesCount: stats.likes,
          commentsCount: stats.comments,
          bookmarksCount: stats.bookmarks,
          interactionState,
        } satisfies BookWithRelations;
      }),
    );

    return {
      books: booksWithStats,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  /**
   * Mettre à jour un livre
   */
  async updateBook(
    id: string,
    userId: string,
    data: UpdateBookDto,
  ): Promise<BookWithRelations> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundException("Livre non trouvé");
    }

    if (book.authorId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à modifier ce livre");
    }

    let updatedSlug: string | undefined;
    if (data.title && data.title !== book.title) {
      updatedSlug = slugify(data.title, {
        lower: true,
        strict: true,
        trim: true,
      });
      const existing = await this.bookRepository.findBySlug(updatedSlug);
      if (existing && existing.id !== id) {
        throw new ConflictException("Un livre avec ce titre existe déjà");
      }
    }

    // Si la catégorie change, vérifier qu'elle existe
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new NotFoundException("Catégorie non trouvée");
      }
    }

    // Si le statut passe à PUBLISHED, définir la date de publication
    const updateData: Prisma.BookUpdateInput = {
      title: data.title,
      synopsis: data.synopsis,
      coverImage: data.coverImage,
      fileUrl: data.fileUrl,
      price: data.price,
      status: data.status,
      ...(updatedSlug ? { slug: updatedSlug } : {}),
      ...(data.categoryId
        ? { category: { connect: { id: data.categoryId } } }
        : {}),
    };
    if (data.status === "PUBLISHED" && book.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    // Mettre à jour les tags si fournis
    if (data.tags) {
      // Supprimer les anciens tags
      await this.bookRepository.clearTags(id);

      // Ajouter les nouveaux tags
      if (data.tags.length > 0) {
        updateData.tags = {
          create: data.tags.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        };
      }
    }

    await this.bookRepository.update(id, updateData);
    return this.getBookWithRelations(id, userId);
  }

  /**
   * Supprimer un livre
   */
  async deleteBook(id: string, userId: string): Promise<void> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundException("Livre non trouvé");
    }

    if (book.authorId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer ce livre");
    }

    await this.bookRepository.delete(id);
  }

  /**
   * Télécharger un livre (incrémenter le compteur)
   */
  async downloadBook(
    bookId: string,
    userId?: string,
  ): Promise<{ downloadUrl: string }> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundException("Livre non trouvé");
    }

    // Vérifier si le livre est gratuit
    const priceValue = Number(book.price ?? 0);
    if (priceValue > 0) {
      // Vérifier si l'utilisateur a acheté le livre
      if (!userId) {
        throw new ForbiddenException("Connectez-vous pour télécharger ce livre");
      }

      // Ici, vérifier si l'utilisateur a acheté le livre
      // const hasPurchased = await this.purchaseRepository.hasPurchased(userId, bookId);
      // if (!hasPurchased) {
      //   throw new ForbiddenException("Vous devez acheter ce livre pour le télécharger");
      // }
    }

    // Incrémenter le compteur de téléchargements
    await this.bookRepository.incrementDownloads(bookId);

    // Retourner l'URL de téléchargement
    // Simuler une URL de téléchargement
    return {
      downloadUrl: `/api/books/${bookId}/download-file`,
    };
  }

  /**
   * Rechercher des livres
   */
  async searchBooks(query: string, page = 1, limit = 10): Promise<BooksListResponse> {
    if (!query || query.length < 2) {
      return {
        books: [],
        total: 0,
        totalPages: 0,
        page,
        limit,
      };
    }

    const result = await this.bookRepository.search(query, page, limit);

    const booksWithStats = await Promise.all(
      result.data.map(async (book) => {
        const stats = await this.bookRepository.getStats(book.id);
        return {
          ...book,
          tags: book.tags.map(({ tag }) => tag),
          price: book.price === null ? null : Number(book.price),
          likesCount: stats.likes,
          commentsCount: stats.comments,
          bookmarksCount: stats.bookmarks,
        } satisfies BookWithRelations;
      }),
    );

    return {
      books: booksWithStats,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      page,
      limit,
    };
  }

  /**
   * Récupérer les livres d'un auteur
   */
  async getAuthorBooks(
    authorId: string,
    options: {
      page?: number;
      limit?: number;
      status?: PostStatus;
      userId?: string;
    } = {},
  ): Promise<BooksListResponse> {
    const { page = 1, limit = 10, status = "PUBLISHED", userId } = options;

    const where: Prisma.BookWhereInput = {
      authorId,
      status,
    };

    // Si l'utilisateur n'est pas l'auteur, ne montrer que les livres publiés
    if (userId !== authorId) {
      where.status = "PUBLISHED";
    }

    const [books, total] = await Promise.all([
      this.bookRepository.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      this.bookRepository.count(where),
    ]);

    const booksWithStats = await Promise.all(
      books.map(async (book) => {
        const stats = await this.bookRepository.getStats(book.id);
        let interactionState = undefined;
        if (userId) {
          interactionState = await this.bookRepository.getUserInteractions(
            book.id,
            userId,
          );
        }

        return {
          ...book,
          tags: book.tags.map(({ tag }) => tag),
          price: book.price === null ? null : Number(book.price),
          likesCount: stats.likes,
          commentsCount: stats.comments,
          bookmarksCount: stats.bookmarks,
          interactionState,
        } satisfies BookWithRelations;
      }),
    );

    return {
      books: booksWithStats,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  /**
   * Récupérer les livres les plus populaires
   */
  async getPopularBooks(limit = 10): Promise<BookWithRelations[]> {
    const books = await this.bookRepository.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { likesCount: "desc" },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return Promise.all(
      books.map(async (book) => {
        const stats = await this.bookRepository.getStats(book.id);
        return {
          ...book,
          tags: [],
          price: book.price === null ? null : Number(book.price),
          likesCount: stats.likes,
          commentsCount: stats.comments,
          bookmarksCount: stats.bookmarks,
        } satisfies BookWithRelations;
      }),
    );
  }

  /**
   * Récupérer les livres gratuits
   */
  async getFreeBooks(
    options: {
      page?: number;
      limit?: number;
      userId?: string;
    } = {},
  ): Promise<BooksListResponse> {
    return this.getBooks({
      ...options,
      status: "PUBLISHED",
      minPrice: 0,
      maxPrice: 0,
    });
  }
}
