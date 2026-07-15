// lib/repositories/like.repository.ts
import { Like, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";
import { TargetRef } from "../types/target";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  avatar: true,
} satisfies Prisma.UserSelect;

export class LikeRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  private targetKey(
    target: TargetRef,
  ): "postId" | "podcastId" | "bookId" | "commentId" {
    return `${target.type}Id` as
      | "postId"
      | "podcastId"
      | "bookId"
      | "commentId";
  }

  async findByUserAndTarget(
    userId: string,
    target: TargetRef,
  ): Promise<Like | null> {
    const key = this.targetKey(target);
    return this.db.like.findFirst({ where: { userId, [key]: target.id } });
  }

  async createForTarget(userId: string, target: TargetRef): Promise<Like> {
    const key = this.targetKey(target);
    return this.db.like.create({
      data: { userId, [key]: target.id } as Prisma.LikeUncheckedCreateInput,
    });
  }

  async delete(id: string): Promise<Like> {
    return this.db.like.delete({ where: { id } });
  }
  async findByUserAndPostIds(
    userId: string,
    postIds: string[],
  ): Promise<Like[]> {
    if (postIds.length === 0) return [];

    return this.db.like.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
    });
  }

  async findByTarget(
    target: TargetRef,
    page = 1,
    limit = 20,
  ): Promise<{ data: Like[]; total: number }> {
    const key = this.targetKey(target);
    const where = { [key]: target.id } as Prisma.LikeWhereInput;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.db.like.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: AUTHOR_SELECT } },
      }),
      this.db.like.count({ where }),
    ]);
    return { data, total };
  }

  async countByTarget(target: TargetRef): Promise<number> {
    const key = this.targetKey(target);
    return this.db.like.count({
      where: { [key]: target.id } as Prisma.LikeWhereInput,
    });
  }
}
