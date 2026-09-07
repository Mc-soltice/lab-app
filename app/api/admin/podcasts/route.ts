// app/api/admin/podcasts/route.ts
import { getCurrentUser } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { PodcastRepository } from "@/lib/repositories/podcast.repository";
import { NextRequest, NextResponse } from "next/server";

const podcastRepository = new PodcastRepository();

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer tous les podcasts
    // Si l'utilisateur est admin, il voit tout
    // Si c'est un auteur, il ne voit que ses podcasts
    let podcasts;
    if (currentUser.role === "ADMIN") {
      const result = await podcastRepository.list(1, 1000);
      podcasts = result.data;
    } else {
      const result = await podcastRepository.findByAuthor(
        currentUser.id,
        1,
        1000,
      );
      podcasts = result.data;
    }

    return NextResponse.json(podcasts);
  } catch (error) {
    return handleError(error);
  }
}
