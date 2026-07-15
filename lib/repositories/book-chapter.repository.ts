// lib/repositories/book-chapter.repository.ts
import { BookChapter, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

export class BookChapterRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.BookChapterCreateInput): Promise<BookChapter> {
    return this.db.bookChapter.create({ data });
  }

  async findById(id: string): Promise<BookChapter | null> {
    return this.db.bookChapter.findUnique({ where: { id } });
  }

  async findByBook(bookId: string): Promise<BookChapter[]> {
    return this.db.bookChapter.findMany({
      where: { bookId, publishedAt: { not: null } },
      orderBy: { order: "asc" },
    });
  }

  async findNextOrder(bookId: string): Promise<number> {
    const last = await this.db.bookChapter.findFirst({
      where: { bookId },
      orderBy: { order: "desc" },
    });
    return (last?.order ?? 0) + 1;
  }

  async update(
    id: string,
    data: Prisma.BookChapterUpdateInput,
  ): Promise<BookChapter> {
    return this.db.bookChapter.update({ where: { id }, data });
  }

  async delete(id: string): Promise<BookChapter> {
    return this.db.bookChapter.delete({ where: { id } });
  }
}
