// lib/repositories/notification.repository.ts
import { Notification, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

export class NotificationRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.db.notification.create({ data });
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    const skip = (page - 1) * limit;
    const [data, total, unreadCount] = await Promise.all([
      this.db.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.notification.count({ where: { userId } }),
      this.db.notification.count({ where: { userId, read: false } }),
    ]);
    return { data, total, unreadCount };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.db.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
