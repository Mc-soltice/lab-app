// app/api/users/[username]/follow/route.ts
import { requireAuth } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { UserRepository } from "@/lib/repositories/user.repository";
import { FollowService } from "@/lib/services/follow.service";
import { UsernameSchema } from "@/lib/validation/schemas";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const followService = new FollowService();
const userRepository = new UserRepository();

const UsernameParamSchema = z.object({
  username: UsernameSchema,
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    // 1. Attendre les params
    const { username } = await params;

    // 2. Valider
    const validated = UsernameParamSchema.parse({ username });

    // 3. Authentification
    const session = await requireAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 4. Recherche de l'utilisateur
    const target = await userRepository.findByUsername(validated.username);
    if (!target) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    // 5. Vérification auto-follow
    if (session.user.id === target.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous suivre vous-même" },
        { status: 400 },
      );
    }

    // 6. Toggle follow
    const following = await followService.toggleFollow(
      session.user.id,
      target.id,
    );

    return NextResponse.json({
      following,
      message: following
        ? "Vous suivez maintenant cet utilisateur"
        : "Vous ne suivez plus cet utilisateur",
    });
  } catch (error) {
    console.error("[Follow API] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Nom d'utilisateur invalide", details: error.errors },
        { status: 400 },
      );
    }

    return handleError(error);
  }
}
