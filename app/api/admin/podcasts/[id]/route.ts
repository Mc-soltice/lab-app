// app/api/admin/podcasts/[id]/route.ts
import { getCurrentUser } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { PodcastRepository } from "@/lib/repositories/podcast.repository";
import { NextRequest, NextResponse } from "next/server";

const podcastRepository = new PodcastRepository();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Vérifier que l'utilisateur est connecté
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que le podcast existe
    const podcast = await podcastRepository.findById(id);
    if (!podcast) {
      return NextResponse.json(
        { error: "Podcast non trouvé" },
        { status: 404 },
      );
    }

    // Vérifier les permissions
    if (currentUser.role !== "ADMIN" && podcast.authorId !== currentUser.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce podcast" },
        { status: 403 },
      );
    }

    // Supprimer le podcast
    await podcastRepository.delete(id);

    return NextResponse.json({
      message: "Podcast supprimé avec succès",
    });
  } catch (error) {
    return handleError(error);
  }
}
