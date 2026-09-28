export type LikeableType = "post" | "podcast" | "book" | "comment";
export type BookmarkableType = Exclude<LikeableType, "comment">;
export type CommentableType = Exclude<LikeableType, "comment">;

export interface LikeTargetDto {
  type: LikeableType;
  id: string;
}

export interface BookmarkTargetDto {
  type: BookmarkableType;
  id: string;
}

export interface CommentTargetDto {
  type: CommentableType;
  id: string;
}

export interface InteractionStateDto {
  isLiked: boolean;
  isBookmarked: boolean;
  likesCount: number;
  bookmarksCount: number;
}

export interface CreateInteractionDto {
  type: LikeableType;
  id: string;
}

export type UpdateInteractionDto = CreateInteractionDto;
