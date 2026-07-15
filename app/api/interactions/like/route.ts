// app/api/interactions/like/route.ts
// Route générique de like (Chapitre 18.4) : couvre post | podcast | book | comment
// en un seul point d'entrée plutôt que de dupliquer la logique par type de contenu.
import { getSession } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { InteractionService } from "@/lib/services/interaction.service";
import { LikeTargetSchema } from "@/lib/validation/schemas";
import { NextRequest, NextResponse } from "next/server";

const interactionService = new InteractionService();

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const target = LikeTargetSchema.parse(body);

    const liked = await interactionService.toggleLike(target, session.user.id);

    return NextResponse.json({ liked });
  } catch (error) {
    return handleError(error);
  }
}
