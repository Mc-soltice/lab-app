// lib/repositories/podcast.repository.ts
import { Podcast, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  avatar: true,
} satisfies Prisma.UserSelect;

export class PodcastRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.PodcastCreateInput): Promise<Podcast> {
    console.dir(data, { depth: null });

    try {
      const result = await this.db.podcast.create({ data });
      console.log(result);
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async findById(id: string): Promise<Podcast | null> {
    return this.db.podcast.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Podcast | null> {
    return this.db.podcast.findUnique({
      where: { slug },
      include: {
        author: { select: AUTHOR_SELECT },
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
      },
    });
  }

  async findByAuthor(
    authorId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Podcast[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.podcast.findMany({
        where: { authorId, status: "PUBLISHED" },
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.db.podcast.count({ where: { authorId, status: "PUBLISHED" } }),
    ]);
    return { data, total };
  }

  async list(
    page = 1,
    limit = 10,
    query?: string,
    categorySlug?: string,
  ): Promise<{ data: Podcast[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PodcastWhereInput = { status: "PUBLISHED" };

    const normalizedQuery = query?.trim();
    const normalizedCategory = categorySlug?.trim();

    if (normalizedQuery) {
      where.OR = [
        { title: { contains: normalizedQuery } },
        { description: { contains: normalizedQuery } },
      ];
    }

    if (normalizedCategory) {
      where.category = { slug: normalizedCategory };
    }

    const [data, total] = await Promise.all([
      this.db.podcast.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: AUTHOR_SELECT },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.db.podcast.count({ where }),
    ]);

    return { data, total };
  }

  async search(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Podcast[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PodcastWhereInput = {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    };
    const [data, total] = await Promise.all([
      this.db.podcast.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.db.podcast.count({ where }),
    ]);
    return { data, total };
  }

  async update(id: string, data: Prisma.PodcastUpdateInput): Promise<Podcast> {
    return this.db.podcast.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Podcast> {
    return this.db.podcast.delete({ where: { id } });
  }

  async incrementPlays(id: string): Promise<void> {
    await this.db.podcast.update({
      where: { id },
      data: { plays: { increment: 1 } },
    });
  }

  async incrementLikes(id: string): Promise<void> {
    await this.db.podcast.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
    });
  }

  async decrementLikes(id: string): Promise<void> {
    await this.db.podcast.update({
      where: { id },
      data: { likesCount: { decrement: 1 } },
    });
  }

  async incrementComments(id: string): Promise<void> {
    await this.db.podcast.update({
      where: { id },
      data: { commentsCount: { increment: 1 } },
    });
  }

  async decrementComments(id: string): Promise<void> {
    await this.db.podcast.update({
      where: { id },
      data: { commentsCount: { decrement: 1 } },
    });
  }

  async incrementBookmarks(id: string): Promise<void> {
    await this.db.podcast.update({
      where: { id },
      data: { bookmarksCount: { increment: 1 } },
    });
  }

  async decrementBookmarks(id: string): Promise<void> {
    await this.db.podcast.update({
      where: { id },
      data: { bookmarksCount: { decrement: 1 } },
    });
  }
}
