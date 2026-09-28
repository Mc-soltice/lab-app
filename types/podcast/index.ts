import type { CategoryReadDto } from "../category";
import type { EmissionReadDto } from "../emission";
import type { PostStatus } from "../post";
import type { TagReadDto } from "../tag";
import type { UserSummaryDto } from "../user";

export type PodcastMediaType = "AUDIO" | "VIDEO";

export interface PodcastReadDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  audioUrl: string;
  mediaType: PodcastMediaType;
  coverImage: string | null;
  duration: number;
  transcript: string | null;
  publishedAt: string | null;
  status: PostStatus;
  plays: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  createdAt: string;
  updatedAt: string;
  author: UserSummaryDto;
  category: CategoryReadDto | null;
  emission: EmissionReadDto | null;
  tags: TagReadDto[];
}

export interface CreatePodcastDto {
  title: string;
  description?: string;
  audioUrl: string;
  mediaType?: PodcastMediaType;
  coverImage?: string;
  duration: number;
  transcript?: string;
  categoryId?: string;
  emissionId?: string;
  tags?: string[];
  status?: Exclude<PostStatus, "ARCHIVED">;
}

export type UpdatePodcastDto = Partial<CreatePodcastDto>;
