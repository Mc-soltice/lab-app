export interface ApiErrorDto {
  error: string;
  message?: string;
  details?: unknown;
}

export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;
}

export interface ApiMessageDto {
  message: string;
}
