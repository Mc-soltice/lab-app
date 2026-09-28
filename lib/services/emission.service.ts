import { Emission } from "@/prisma/generated/client";
import type { CreateEmissionDto } from "@/types/emission";
import slugify from "slugify";
import { ConflictException } from "../exceptions";
import { EmissionRepository } from "../repositories/emission.repository";

export class EmissionService {
  private emissionRepository = new EmissionRepository();

  async listEmissions(): Promise<Emission[]> {
    return this.emissionRepository.findAll();
  }

  async createEmission(data: CreateEmissionDto): Promise<Emission> {
    const slug = slugify(data.title, { lower: true, strict: true });
    const existing = await this.emissionRepository.findBySlug(slug);
    if (existing) throw new ConflictException("Cette émission existe déjà");

    return this.emissionRepository.create({ ...data, slug });
  }
}
