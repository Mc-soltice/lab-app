// lib/services/user.service.ts
import { User } from "@/prisma/generated/client";
import { hash } from "bcrypt";
import { z } from "zod";
import { ConflictException, NotFoundException } from "../exceptions";
import { UserRepository } from "../repositories/user.repository";
import { RegisterSchema, UpdateProfileSchema } from "../validation/schemas";

export class UserService {
  private userRepository = new UserRepository();

  async register(data: z.infer<typeof RegisterSchema>): Promise<User> {
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail)
      throw new ConflictException("Cet email est déjà utilisé");

    const existingUsername = await this.userRepository.findByUsername(
      data.username,
    );
    if (existingUsername)
      throw new ConflictException("Ce nom d'utilisateur est déjà pris");

    const hashedPassword = await hash(data.password, 10);

    return this.userRepository.create({
      email: data.email,
      username: data.username,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });
  }

  async getProfile(username: string): Promise<User> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");
    return user;
  }

  async updateProfile(
    userId: string,
    data: z.infer<typeof UpdateProfileSchema>,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");
    return this.userRepository.update(userId, data);
  }
}
