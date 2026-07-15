// lib/repositories/post.repository.ts
import { Post, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  avatar: true,
} satisfies Prisma.UserSelect;

export class PostRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return this.db.post.create({ data });
  }

  async findById(id: string): Promise<Post | null> {
    return this.db.post.findUnique({
      where: { id },
      include: {
        author: { select: AUTHOR_SELECT },
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return this.db.post.findUnique({
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
  ): Promise<{ data: Post[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.post.findMany({
        where: { authorId, status: "PUBLISHED" },
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: AUTHOR_SELECT },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.db.post.count({ where: { authorId, status: "PUBLISHED" } }),
    ]);
    return { data, total };
  }
  async findByAuthorForOwner(
    authorId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Post[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PostWhereInput = { authorId }; // pas de filtre status
    const [data, total] = await Promise.all([
      this.db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: AUTHOR_SELECT },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.db.post.count({ where }),
    ]);
    return { data, total };
  }

  async findByCategory(
    categoryId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Post[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.post.findMany({
        where: { categoryId, status: "PUBLISHED" },
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: AUTHOR_SELECT },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.db.post.count({ where: { categoryId, status: "PUBLISHED" } }),
    ]);
    return { data, total };
  }

  async findByTag(
    tagId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Post[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PostWhereInput = {
      status: "PUBLISHED",
      tags: { some: { tagId } },
    };
    const [data, total] = await Promise.all([
      this.db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.db.post.count({ where }),
    ]);
    return { data, total };
  }

  async getFeed(
    userId?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Post[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PostWhereInput = { status: "PUBLISHED" };

    const [data, total] = await Promise.all([
      this.db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: AUTHOR_SELECT },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.db.post.count({ where }),
    ]);
    return { data, total };
  }

  async search(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Post[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PostWhereInput = {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { excerpt: { contains: query } },
      ],
    };

    const [data, total] = await Promise.all([
      this.db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.db.post.count({ where }),
    ]);
    return { data, total };
  }

  async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
    return this.db.post.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Post> {
    return this.db.post.delete({ where: { id } });
  }

  async incrementViews(id: string): Promise<void> {
    await this.db.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async incrementLikes(id: string): Promise<void> {
    await this.db.post.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
    });
  }

  async decrementLikes(id: string): Promise<void> {
    await this.db.post.update({
      where: { id },
      data: { likesCount: { decrement: 1 } },
    });
  }

  async incrementComments(id: string): Promise<void> {
    await this.db.post.update({
      where: { id },
      data: { commentsCount: { increment: 1 } },
    });
  }

  async decrementComments(id: string): Promise<void> {
    await this.db.post.update({
      where: { id },
      data: { commentsCount: { decrement: 1 } },
    });
  }

  async incrementBookmarks(id: string): Promise<void> {
    await this.db.post.update({
      where: { id },
      data: { bookmarksCount: { increment: 1 } },
    });
  }

  async decrementBookmarks(id: string): Promise<void> {
    await this.db.post.update({
      where: { id },
      data: { bookmarksCount: { decrement: 1 } },
    });
  }
}
