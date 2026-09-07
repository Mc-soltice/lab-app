// lib/services/notification.service.ts
import { NotificationType } from "@/prisma/generated/client";
import { NotificationRepository } from "../repositories/notification.repository";
import { CommentTargetRef, TargetRef } from "../types/target";

export class NotificationService {
  private notificationRepository = new NotificationRepository();

  async notifyLike(
    recipientId: string,
    actorId: string,
    target: TargetRef,
  ): Promise<void> {
    await this.notificationRepository.create({
      type: NotificationType.LIKE,
      message: this.buildLikeMessage(target),
      user: { connect: { id: recipientId } },
      actorId,
      postId: target.type === "post" ? target.id : undefined,
      podcastId: target.type === "podcast" ? target.id : undefined,
      bookId: target.type === "book" ? target.id : undefined,
      commentId: target.type === "comment" ? target.id : undefined,
    });
  }

  async notifyComment(
    recipientId: string,
    actorId: string,
    target: CommentTargetRef,
  ): Promise<void> {
    await this.notificationRepository.create({
      type: NotificationType.COMMENT,
      message: this.buildCommentMessage(target),
      user: { connect: { id: recipientId } },
      actorId,
      postId: target.type === "post" ? target.id : undefined,
      podcastId: target.type === "podcast" ? target.id : undefined,
      bookId: target.type === "book" ? target.id : undefined,
    });
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    return this.notificationRepository.findByUser(userId, page, limit);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  private buildLikeMessage(target: TargetRef): string {
    switch (target.type) {
      case "post":
        return "a aimé votre publication";
      case "podcast":
        return "a aimé votre podcast";
      case "book":
        return "a aimé votre livre";
      case "comment":
        return "a aimé votre commentaire";
    }
  }

  private buildCommentMessage(target: CommentTargetRef): string {
    switch (target.type) {
      case "post":
        return "a commenté votre publication";
      case "podcast":
        return "a commenté votre podcast";
      case "book":
        return "a commenté votre livre";
    }
  }
}
