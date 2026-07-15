// app/api/users/[username]/route.ts - CORRIGÉ
import { getCurrentUser } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { UserService } from "@/lib/services/user.service";
import { UsernameSchema } from "@/lib/validation/schemas";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const userService = new UserService();

const UsernameParamSchema = z.object({
  username: UsernameSchema,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }, // ✅ Promise
) {
  try {
    // ✅ Attendre les params
    const { username } = await params;
    const validated = UsernameParamSchema.parse({ username });

    // Optionnel : récupérer l'utilisateur courant pour des données personnalisées
    const currentUser = await getCurrentUser();

    const user = await userService.getProfile(validated.username);

    // Ne jamais renvoyer le mot de passe hashé
    const { password: _password, ...publicProfile } = user;

    // Ajouter des informations de suivi si l'utilisateur est connecté
    if (currentUser && currentUser.id !== user.id) {
      // Vous pouvez ajouter ici des infos comme isFollowing
      // publicProfile.isFollowing = await checkIfFollowing(currentUser.id, user.id);
    }

    return NextResponse.json(publicProfile);
  } catch (error) {
    console.error("[User Profile API] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Nom d'utilisateur invalide", details: error.errors },
        { status: 400 },
      );
    }
    return handleError(error);
  }
}
