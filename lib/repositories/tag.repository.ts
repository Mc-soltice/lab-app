// lib/repositories/tag.repository.ts
import { Prisma, PrismaClient, Tag } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

export class TagRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.TagCreateInput): Promise<Tag> {
    return this.db.tag.create({ data });
  }

  async findAll(): Promise<Tag[]> {
    return this.db.tag.findMany({ orderBy: { name: "asc" } });
  }

  async findById(id: string): Promise<Tag | null> {
    return this.db.tag.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    return this.db.tag.findUnique({ where: { slug } });
  }
}
