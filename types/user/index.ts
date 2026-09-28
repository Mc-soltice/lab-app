export type UserRole = "BLOGGER" | "ADMIN";

export interface UserSummaryDto {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role?: UserRole;
}

export interface UserReadDto extends UserSummaryDto {
  email?: string;
  bio: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
