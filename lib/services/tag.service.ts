// lib/services/tag.service.ts
import { Tag } from "@/prisma/generated/client";
import type { CreateTagDto } from "@/types/tag";
import slugify from "slugify";
import { ConflictException, NotFoundException } from "../exceptions";
import { PostRepository } from "../repositories/post.repository";
import { TagRepository } from "../repositories/tag.repository";

export class TagService {
  private tagRepository = new TagRepository();
  private postRepository = new PostRepository();

  async listTags(): Promise<Tag[]> {
    return this.tagRepository.findAll();
  }

  async createTag(data: CreateTagDto): Promise<Tag> {
    const slug = slugify(data.name, { lower: true, strict: true });
    const existing = await this.tagRepository.findBySlug(slug);
    if (existing) throw new ConflictException("Ce tag existe déjà");

    return this.tagRepository.create({ ...data, slug });
  }

  async getTagBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepository.findBySlug(slug);
    if (!tag) throw new NotFoundException("Tag non trouvé");
    return tag;
  }

  async getTagPosts(slug: string, page = 1, limit = 10) {
    const tag = await this.getTagBySlug(slug);
    return this.postRepository.findByTag(tag.id, page, limit);
  }
}
