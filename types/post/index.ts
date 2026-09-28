import type { CategoryReadDto } from "../category";
import type { TagReadDto } from "../tag";
import type { UserSummaryDto } from "../user";

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface PostReadDto {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  status: PostStatus;
  views: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  createdAt: string;
  updatedAt: string;
  author: UserSummaryDto;
  category: CategoryReadDto | null;
  tags: TagReadDto[];
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string;
  tags?: string[];
  status?: Exclude<PostStatus, "ARCHIVED">;
}

export type UpdatePostDto = Partial<CreatePostDto>;
