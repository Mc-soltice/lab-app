// lib/repositories/comment.repository.ts
import { Comment, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";
import { CommentTargetRef } from "../types/target";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  avatar: true,
} satisfies Prisma.UserSelect;

export class CommentRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  private targetKey(
    target: CommentTargetRef,
  ): "postId" | "podcastId" | "bookId" {
    return `${target.type}Id` as "postId" | "podcastId" | "bookId";
  }

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return this.db.comment.create({ data });
  }

  async createForTarget(
    authorId: string,
    target: CommentTargetRef,
    content: string,
  ): Promise<Comment> {
    const key = this.targetKey(target);
    return this.db.comment.create({
      data: {
        content,
        authorId,
        [key]: target.id,
      } as Prisma.CommentUncheckedCreateInput,
    });
  }

  async findById(id: string): Promise<Comment | null> {
    return this.db.comment.findUnique({
      where: { id },
      include: {
        author: { select: AUTHOR_SELECT },
        parent: {
          select: {
            id: true,
            content: true,
            author: { select: { username: true } },
          },
        },
      },
    });
  }

  async findByTarget(
    target: CommentTargetRef,
    page = 1,
    limit = 10,
  ): Promise<{ data: Comment[]; total: number }> {
    const key = this.targetKey(target);
    const where: Prisma.CommentWhereInput = {
      [key]: target.id,
      parentId: null,
    };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.db.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: AUTHOR_SELECT },
          _count: { select: { replies: true } },
        },
      }),
      this.db.comment.count({ where }),
    ]);
    return { data, total };
  }

  async findReplies(
    commentId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Comment[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.comment.findMany({
        where: { parentId: commentId },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.db.comment.count({ where: { parentId: commentId } }),
    ]);
    return { data, total };
  }

  async update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return this.db.comment.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Comment> {
    return this.db.comment.delete({ where: { id } });
  }

  async incrementLikes(id: string): Promise<void> {
    await this.db.comment.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
    });
  }

  async decrementLikes(id: string): Promise<void> {
    await this.db.comment.update({
      where: { id },
      data: { likesCount: { decrement: 1 } },
    });
  }

  async incrementReplies(id: string): Promise<void> {
    await this.db.comment.update({
      where: { id },
      data: { repliesCount: { increment: 1 } },
    });
  }

  async decrementReplies(id: string): Promise<void> {
    await this.db.comment.update({
      where: { id },
      data: { repliesCount: { decrement: 1 } },
    });
  }
}
