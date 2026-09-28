export interface EmissionReadDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmissionDto {
  title: string;
  description?: string;
}

export type UpdateEmissionDto = Partial<CreateEmissionDto>;
