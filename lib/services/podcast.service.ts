// lib/services/podcast.service.ts
import { Podcast, Prisma } from "@/prisma/generated/client";
import slugify from "slugify";
import { z } from "zod";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../exceptions";
import { CategoryRepository } from "../repositories/category.repository";
import { PodcastRepository } from "../repositories/podcast.repository";
import { UserRepository } from "../repositories/user.repository";
import {
  CreatePodcastSchema,
  UpdatePodcastSchema,
} from "../validation/schemas";

export class PodcastService {
  private podcastRepository = new PodcastRepository();
  private userRepository = new UserRepository();
  private categoryRepository = new CategoryRepository();

  async createPodcast(
    authorId: string,
    data: z.infer<typeof CreatePodcastSchema>,
  ): Promise<Podcast> {
    const user = await this.userRepository.findById(authorId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) throw new NotFoundException("Catégorie non trouvée");
    }

    const slug = slugify(data.title, { lower: true, strict: true });
    const existing = await this.podcastRepository.findBySlug(slug);
    if (existing)
      throw new ConflictException("Un podcast avec ce titre existe déjà");

    const podcastData: Prisma.PodcastCreateInput = {
      title: data.title,
      slug,
      description: data.description,
      audioUrl: data.audioUrl,
      coverImage: data.coverImage,
      duration: data.duration,
      transcript: data.transcript,
      status: data.status || "DRAFT",
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      author: { connect: { id: authorId } },
      category: data.categoryId
        ? { connect: { id: data.categoryId } }
        : undefined,
      tags: data.tags?.length
        ? {
            create: data.tags.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          }
        : undefined,
    };

    return this.podcastRepository.create(podcastData);
  }

  async getPodcastBySlug(slug: string): Promise<Podcast> {
    const podcast = await this.podcastRepository.findBySlug(slug);
    if (!podcast || podcast.status !== "PUBLISHED") {
      throw new NotFoundException("Podcast non trouvé");
    }
    await this.podcastRepository.incrementPlays(podcast.id);
    return podcast;
  }

  async updatePodcast(
    id: string,
    userId: string,
    data: z.infer<typeof UpdatePodcastSchema>,
  ): Promise<Podcast> {
    const podcast = await this.podcastRepository.findById(id);
    if (!podcast) throw new NotFoundException("Podcast non trouvé");
    if (podcast.authorId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ce podcast",
      );
    }

    const updateData: Prisma.PodcastUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.audioUrl !== undefined) updateData.audioUrl = data.audioUrl;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.transcript !== undefined) updateData.transcript = data.transcript;
    if (data.categoryId !== undefined) {
      updateData.category = data.categoryId
        ? { connect: { id: data.categoryId } }
        : { disconnect: true };
    }
    if (data.tags !== undefined) {
      updateData.tags = {
        deleteMany: {},
        create: data.tags.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      };
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "PUBLISHED" && podcast.status !== "PUBLISHED") {
        updateData.publishedAt = new Date();
      }
    }

    return this.podcastRepository.update(id, updateData);
  }

  async deletePodcast(id: string, userId: string): Promise<void> {
    const podcast = await this.podcastRepository.findById(id);
    if (!podcast) throw new NotFoundException("Podcast non trouvé");
    if (podcast.authorId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer ce podcast",
      );
    }
    await this.podcastRepository.delete(id);
  }

  async getPublishedPodcasts(
    page = 1,
    limit = 10,
    query?: string,
    categorySlug?: string,
  ) {
    return this.podcastRepository.list(page, limit, query, categorySlug);
  }

  async getUserPodcasts(authorId: string, page = 1, limit = 10) {
    return this.podcastRepository.findByAuthor(authorId, page, limit);
  }

  async getUserPodcastsByUsername(
    username: string,
    viewerId?: string,
    page = 1,
    limit = 10,
  ) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      return { data: [], total: 0 };
    }

    return this.podcastRepository.findByAuthor(user.id, page, limit);
  }

  async searchPodcasts(query: string, page = 1, limit = 10) {
    if (!query || query.length < 2) return { data: [], total: 0 };
    return this.podcastRepository.search(query, page, limit);
  }
}
