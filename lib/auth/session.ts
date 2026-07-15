// lib/auth/session.ts
import { getServerSession } from "next-auth";
import { prisma } from "../prisma/client";
import { authOptions } from "./auth-options";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// Helper pour les routes API avec gestion d'erreur intégrée
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }
  return session;
}

// Vérifier si l'utilisateur est admin
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Accès non autorisé - Admin requis");
  }
  return session;
}
