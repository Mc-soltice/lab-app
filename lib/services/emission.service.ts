import { Emission } from "@/prisma/generated/client";
import slugify from "slugify";
import { z } from "zod";
import { ConflictException } from "../exceptions";
import { EmissionRepository } from "../repositories/emission.repository";
import { CreateEmissionSchema } from "../validation/schemas";

export class EmissionService {
  private emissionRepository = new EmissionRepository();

  async listEmissions(): Promise<Emission[]> {
    return this.emissionRepository.findAll();
  }

  async createEmission(data: z.infer<typeof CreateEmissionSchema>): Promise<Emission> {
    const slug = slugify(data.title, { lower: true, strict: true });
    const existing = await this.emissionRepository.findBySlug(slug);
    if (existing) throw new ConflictException("Cette émission existe déjà");

    return this.emissionRepository.create({ ...data, slug });
  }
}
