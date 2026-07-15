// lib/services/category.service.ts
import { Category } from "@/prisma/generated/client";
import slugify from "slugify";
import { z } from "zod";
import { ConflictException, NotFoundException } from "../exceptions";
import { CategoryRepository } from "../repositories/category.repository";
import { PostRepository } from "../repositories/post.repository";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "../validation/schemas";

export class CategoryService {
  private categoryRepository = new CategoryRepository();
  private postRepository = new PostRepository();

  async listCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async createCategory(
    data: z.infer<typeof CreateCategorySchema>,
  ): Promise<Category> {
    const slug = slugify(data.name, { lower: true, strict: true });
    const existing = await this.categoryRepository.findBySlug(slug);
    if (existing) throw new ConflictException("Cette catégorie existe déjà");

    return this.categoryRepository.create({ ...data, slug });
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) throw new NotFoundException("Catégorie non trouvée");
    return category;
  }

  async updateCategory(
    id: string,
    data: z.infer<typeof UpdateCategorySchema>,
  ): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException("Catégorie non trouvée");
    return this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException("Catégorie non trouvée");
    await this.categoryRepository.delete(id);
  }

  async getCategoryPosts(slug: string, page = 1, limit = 10) {
    const category = await this.getCategoryBySlug(slug);
    return this.postRepository.findByCategory(category.id, page, limit);
  }
}
