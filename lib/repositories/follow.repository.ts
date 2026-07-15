// lib/repositories/follow.repository.ts
import { Follow, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

const USER_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  avatar: true,
} satisfies Prisma.UserSelect;

export class FollowRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.FollowCreateInput): Promise<Follow> {
    return this.db.follow.create({ data });
  }

  async findByFollowerAndFollowing(
    followerId: string,
    followingId: string,
  ): Promise<Follow | null> {
    return this.db.follow.findFirst({ where: { followerId, followingId } });
  }

  async exists(followerId: string, followingId: string): Promise<boolean> {
    const count = await this.db.follow.count({
      where: { followerId, followingId },
    });
    return count > 0;
  }

  async getFollowers(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Follow[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { follower: { select: USER_SELECT } },
      }),
      this.db.follow.count({ where: { followingId: userId } }),
    ]);
    return { data, total };
  }

  async getFollowing(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Follow[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { following: { select: USER_SELECT } },
      }),
      this.db.follow.count({ where: { followerId: userId } }),
    ]);
    return { data, total };
  }

  async countFollowers(userId: string): Promise<number> {
    return this.db.follow.count({ where: { followingId: userId } });
  }

  async countFollowing(userId: string): Promise<number> {
    return this.db.follow.count({ where: { followerId: userId } });
  }

  async delete(id: string): Promise<Follow> {
    return this.db.follow.delete({ where: { id } });
  }
  async findByFollowerAndAuthorIds(
    followerId: string,
    authorIds: string[],
  ): Promise<Follow[]> {
    if (authorIds.length === 0) return [];

    return this.db.follow.findMany({
      where: {
        followerId,
        followingId: { in: authorIds },
      },
    });
  }
}
