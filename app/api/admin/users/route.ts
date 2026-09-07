// app/api/admin/users/route.ts
import { getCurrentUser } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { UserRepository } from "@/lib/repositories/user.repository";
import { NextRequest, NextResponse } from "next/server";

const userRepository = new UserRepository();

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    // Récupérer tous les utilisateurs
    const users = await userRepository.findAll();

    // Ne jamais renvoyer les mots de passe hashés
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    return handleError(error);
  }
}
