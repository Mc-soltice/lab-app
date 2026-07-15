// lib/types/target.ts
// Types partagés pour le polymorphisme des interactions (Like, Comment, Bookmark).

export type LikeableType = "post" | "podcast" | "book" | "comment";
export type BookmarkableType = "post" | "podcast" | "book";
export type CommentableType = "post" | "podcast" | "book";

export interface TargetRef {
  type: LikeableType;
  id: string;
}

export interface BookmarkTargetRef {
  type: BookmarkableType;
  id: string;
}

export interface CommentTargetRef {
  type: CommentableType;
  id: string;
}
