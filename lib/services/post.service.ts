// lib/services/post.service.ts
import { Post, Prisma } from "@/prisma/generated/client";
import slugify from "slugify";
import { z } from "zod";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../exceptions";
import { CategoryRepository } from "../repositories/category.repository";
import { PostRepository } from "../repositories/post.repository";
import { UserRepository } from "../repositories/user.repository";
import { CreatePostSchema, UpdatePostSchema } from "../validation/schemas";

export class PostService {
  private postRepository = new PostRepository();
  private userRepository = new UserRepository();
  private categoryRepository = new CategoryRepository();

  async createPost(
    authorId: string,
    data: z.infer<typeof CreatePostSchema>,
  ): Promise<Post> {
    const user = await this.userRepository.findById(authorId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) throw new NotFoundException("Catégorie non trouvée");
    }

    const slug = this.generateSlug(data.title);
    const existingPost = await this.postRepository.findBySlug(slug);
    if (existingPost)
      throw new ConflictException("Un article avec ce titre existe déjà");

    const postData: Prisma.PostCreateInput = {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt || data.content.substring(0, 200),
      coverImage: data.coverImage,
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

    return this.postRepository.create(postData);
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findBySlug(slug);
    if (!post || post.status !== "PUBLISHED") {
      throw new NotFoundException("Article non trouvé");
    }
    await this.postRepository.incrementViews(post.id);
    return post;
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundException("Article non trouvé");
    return post;
  }

  async updatePost(
    id: string,
    userId: string,
    data: z.infer<typeof UpdatePostSchema>,
  ): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundException("Article non trouvé");
    if (post.authorId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier cet article",
      );
    }

    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) throw new NotFoundException("Catégorie non trouvée");
    }

    const updateData: Prisma.PostUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = this.generateSlug(data.title);
    }
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.categoryId !== undefined) {
      updateData.category = data.categoryId
        ? { connect: { id: data.categoryId } }
        : { disconnect: true };
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "PUBLISHED" && post.status !== "PUBLISHED") {
        updateData.publishedAt = new Date();
      }
    }

    return this.postRepository.update(id, updateData);
  }

  async deletePost(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundException("Article non trouvé");
    if (post.authorId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer cet article",
      );
    }
    await this.postRepository.delete(id);
  }

  async getFeed(userId?: string, page = 1, limit = 10) {
    return this.postRepository.getFeed(userId, page, limit);
  }

  async getUserPosts(
    username: string,
    viewerId?: string,
    page = 1,
    limit = 10,
  ) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    const isOwner = viewerId === user.id;

    return isOwner
      ? this.postRepository.findByAuthorForOwner(user.id, page, limit)
      : this.postRepository.findByAuthor(user.id, page, limit);
  }

  async searchPosts(query: string, page = 1, limit = 10) {
    if (!query || query.length < 2) return { data: [], total: 0 };
    return this.postRepository.search(query, page, limit);
  }

  private generateSlug(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
}
