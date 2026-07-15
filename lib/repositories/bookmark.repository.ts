// lib/repositories/bookmark.repository.ts
import { Bookmark, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";
import { BookmarkTargetRef } from "../types/target";

export class BookmarkRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  private targetKey(
    target: BookmarkTargetRef,
  ): "postId" | "podcastId" | "bookId" {
    return `${target.type}Id` as "postId" | "podcastId" | "bookId";
  }

  async findByUserAndTarget(
    userId: string,
    target: BookmarkTargetRef,
  ): Promise<Bookmark | null> {
    const key = this.targetKey(target);
    return this.db.bookmark.findFirst({ where: { userId, [key]: target.id } });
  }

  async createForTarget(
    userId: string,
    target: BookmarkTargetRef,
  ): Promise<Bookmark> {
    const key = this.targetKey(target);
    return this.db.bookmark.create({
      data: { userId, [key]: target.id } as Prisma.BookmarkUncheckedCreateInput,
    });
  }

  async delete(id: string): Promise<Bookmark> {
    return this.db.bookmark.delete({ where: { id } });
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Bookmark[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.bookmark.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          post: {
            select: { id: true, title: true, slug: true, coverImage: true },
          },
          podcast: {
            select: { id: true, title: true, slug: true, coverImage: true },
          },
          book: {
            select: { id: true, title: true, slug: true, coverImage: true },
          },
        },
      }),
      this.db.bookmark.count({ where: { userId } }),
    ]);
    return { data, total };
  }
  async findByUserAndPostIds(
    userId: string,
    postIds: string[],
  ): Promise<Bookmark[]> {
    if (postIds.length === 0) return [];

    return this.db.bookmark.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
    });
  }
}
