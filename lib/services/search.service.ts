// lib/services/search.service.ts
import { PostService } from "./post.service";
import { PodcastService } from "./podcast.service";
import { BookService } from "./book.service";
import { prisma } from "../prisma/client";
import { SearchSchema } from "../validation/schemas";
import { z } from "zod";

export class SearchService {
  private postService = new PostService();
  private podcastService = new PodcastService();
  private bookService = new BookService();

  async search(params: z.infer<typeof SearchSchema>) {
    const { q, type, page, limit } = params;

    if (type === "users") {
      return this.searchUsers(q, page, limit);
    }
    if (type === "tags") {
      return this.searchTags(q, page, limit);
    }
    if (type === "posts") {
      return this.postService.searchPosts(q, page, limit);
    }
    if (type === "podcasts") {
      return this.podcastService.searchPodcasts(q, page, limit);
    }
    if (type === "books") {
      return this.bookService.searchBooks(q, page, limit);
    }

    // type === "all" : Principe 5 (jamais "tout" en une seule requête lourde) ->
    // on renvoie un aperçu court par catégorie, chacune paginable via son propre endpoint.
    const previewLimit = Math.min(limit, 5);
    const [posts, podcasts, books, users] = await Promise.all([
      this.postService.searchPosts(q, 1, previewLimit),
      this.podcastService.searchPodcasts(q, 1, previewLimit),
      this.bookService.searchBooks(q, 1, previewLimit),
      this.searchUsers(q, 1, previewLimit),
    ]);

    return { posts, podcasts, books, users };
  }

  private async searchUsers(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { username: { contains: query } },
        { firstName: { contains: query } },
        { lastName: { contains: query } },
      ],
    };
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: { id: true, username: true, firstName: true, lastName: true, avatar: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { data, total };
  }

  private async searchTags(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { name: { contains: query } };
    const [data, total] = await Promise.all([
      prisma.tag.findMany({ where, skip, take: limit }),
      prisma.tag.count({ where }),
    ]);
    return { data, total };
  }
}
