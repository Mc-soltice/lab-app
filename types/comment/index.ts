import type { UserSummaryDto } from "../user";

export type CommentableType = "post" | "podcast" | "book";

export interface CommentReadDto {
  id: string;
  content: string;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  author: UserSummaryDto;
  parentId: string | null;
  replies?: CommentReadDto[];
}

export interface CreateCommentDto {
  content: string;
}

export interface CreateReplyDto extends CreateCommentDto {
  parentId: string;
}

export interface CommentTargetDto {
  type: CommentableType;
  id: string;
}

export type UpdateCommentDto = Partial<CreateCommentDto>;
