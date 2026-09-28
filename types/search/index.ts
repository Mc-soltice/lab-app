import type { BookReadDto } from "../book";
import type { PodcastReadDto } from "../podcast";
import type { PostReadDto } from "../post";
import type { TagReadDto } from "../tag";
import type { UserReadDto } from "../user";

export type SearchType = "all" | "posts" | "podcasts" | "books" | "users" | "tags";

export interface SearchDto {
  q: string;
  type?: SearchType;
  page?: number;
  limit?: number;
}

export interface SearchResultsDto {
  posts: PostReadDto[];
  podcasts: PodcastReadDto[];
  books: BookReadDto[];
  users: UserReadDto[];
  tags: TagReadDto[];
}
