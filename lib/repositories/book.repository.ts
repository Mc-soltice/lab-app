// lib/repositories/book.repository.ts
import { Book, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  avatar: true,
} satisfies Prisma.UserSelect;

export class BookRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.BookCreateInput): Promise<Book> {
    return this.db.book.create({ data });
  }

  async findById(id: string): Promise<Book | null> {
    return this.db.book.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Book | null> {
    return this.db.book.findUnique({
      where: { slug },
      include: {
        author: { select: AUTHOR_SELECT },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async findBySlugWithRelations(slug: string): Promise<Book | null> {
    return this.db.book.findUnique({
      where: { slug },
      include: {
        author: { select: AUTHOR_SELECT },
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  async findByIdWithRelations(id: string): Promise<Book | null> {
    return this.db.book.findUnique({
      where: { id },
      include: {
        author: { select: AUTHOR_SELECT },
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  async getStats(
    id: string,
  ): Promise<{ likes: number; comments: number; bookmarks: number }> {
    const book = await this.db.book.findUnique({
      where: { id },
      select: {
        likesCount: true,
        commentsCount: true,
        bookmarksCount: true,
      },
    });

    return {
      likes: book?.likesCount ?? 0,
      comments: book?.commentsCount ?? 0,
      bookmarks: book?.bookmarksCount ?? 0,
    };
  }

  async getUserInteractions(bookId: string, userId: string) {
    return {
      isLiked: false,
      isBookmarked: false,
    };
  }

  async findMany(args: Prisma.BookFindManyArgs): Promise<Book[]> {
    return this.db.book.findMany(args);
  }

  async count(where: Prisma.BookWhereInput): Promise<number> {
    return this.db.book.count({ where });
  }

  async findByAuthor(
    authorId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Book[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.book.findMany({
        where: { authorId, status: "PUBLISHED" },
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.db.book.count({ where: { authorId, status: "PUBLISHED" } }),
    ]);
    return { data, total };
  }

  async search(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Book[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.BookWhereInput = {
      status: "PUBLISHED",
      OR: [{ title: { contains: query } }, { synopsis: { contains: query } }],
    };
    const [data, total] = await Promise.all([
      this.db.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.db.book.count({ where }),
    ]);
    return { data, total };
  }

  async update(id: string, data: Prisma.BookUpdateInput): Promise<Book> {
    return this.db.book.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Book> {
    return this.db.book.delete({ where: { id } });
  }

  async incrementLikes(id: string): Promise<void> {
    await this.db.book.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
    });
  }

  async decrementLikes(id: string): Promise<void> {
    await this.db.book.update({
      where: { id },
      data: { likesCount: { decrement: 1 } },
    });
  }

  async incrementComments(id: string): Promise<void> {
    await this.db.book.update({
      where: { id },
      data: { commentsCount: { increment: 1 } },
    });
  }

  async decrementComments(id: string): Promise<void> {
    await this.db.book.update({
      where: { id },
      data: { commentsCount: { decrement: 1 } },
    });
  }

  async incrementBookmarks(id: string): Promise<void> {
    await this.db.book.update({
      where: { id },
      data: { bookmarksCount: { increment: 1 } },
    });
  }

  async decrementBookmarks(id: string): Promise<void> {
    await this.db.book.update({
      where: { id },
      data: { bookmarksCount: { decrement: 1 } },
    });
  }

  async incrementDownloads(id: string): Promise<void> {
    await this.db.book.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  }

  async clearTags(id: string): Promise<void> {
    await this.db.bookTag.deleteMany({ where: { bookId: id } });
  }
}
