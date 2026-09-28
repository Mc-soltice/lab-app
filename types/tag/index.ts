export interface TagReadDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

export interface CreateTagDto {
  name: string;
  description?: string;
}

export type UpdateTagDto = Partial<CreateTagDto>;
