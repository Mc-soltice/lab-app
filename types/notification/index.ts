import type { UserSummaryDto } from "../user";

export type NotificationType = "LIKE" | "COMMENT" | "SHARE";

export interface NotificationReadDto {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  actor: UserSummaryDto | null;
  postId: string | null;
  podcastId: string | null;
  bookId: string | null;
  commentId: string | null;
}

export interface CreateNotificationDto {
  type: NotificationType;
  message: string;
  userId: string;
  actorId?: string;
  postId?: string;
  podcastId?: string;
  bookId?: string;
  commentId?: string;
}

export interface UpdateNotificationDto {
  read?: boolean;
}
