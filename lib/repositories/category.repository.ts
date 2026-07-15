// lib/repositories/category.repository.ts
import { Category, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

export class CategoryRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.db.category.create({ data });
  }

  async findAll(): Promise<Category[]> {
    return this.db.category.findMany({ orderBy: { name: "asc" } });
  }

  async findById(id: string): Promise<Category | null> {
    return this.db.category.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.db.category.findUnique({ where: { slug } });
  }

  async update(
    id: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return this.db.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Category> {
    return this.db.category.delete({ where: { id } });
  }
}
