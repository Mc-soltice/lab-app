import type { CategoryReadDto } from "../category";
import type { PostStatus } from "../post";
import type { TagReadDto } from "../tag";
import type { UserSummaryDto } from "../user";

export interface BookReadDto {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  price: number | null;
  coverImage: string | null;
  fileUrl: string | null;
  status: PostStatus;
  downloadCount: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: UserSummaryDto;
  category: CategoryReadDto | null;
  tags: TagReadDto[];
}

export interface CreateBookDto {
  title: string;
  synopsis?: string;
  coverImage?: string;
  fileUrl?: string;
  price?: number;
  categoryId?: string;
  tags?: string[];
  status?: Exclude<PostStatus, "ARCHIVED">;
}

export type UpdateBookDto = Partial<CreateBookDto>;

export interface BookServiceReadDto {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  price: number | null;
  coverImage: string | null;
  fileUrl: string | null;
  status: PostStatus;
  downloadCount: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  categoryId: string | null;
  author: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  chapters?: Array<{
    id: string;
    title: string;
    order: number;
    publishedAt?: Date | null;
  }>;
  _count?: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  interactionState?: {
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
}

export interface BooksListResponseDto {
  books: BookServiceReadDto[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}
