import { Emission, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

export class EmissionRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.EmissionCreateInput): Promise<Emission> {
    return this.db.emission.create({ data });
  }

  async findAll(): Promise<Emission[]> {
    return this.db.emission.findMany({ orderBy: { title: "asc" } });
  }

  async findById(id: string): Promise<Emission | null> {
    return this.db.emission.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Emission | null> {
    return this.db.emission.findUnique({ where: { slug } });
  }
}
