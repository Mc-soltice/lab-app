// app/api/admin/posts/[id]/route.ts
import { getCurrentUser } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { PostRepository } from "@/lib/repositories/post.repository";
import { NextRequest, NextResponse } from "next/server";

const postRepository = new PostRepository();

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

    // Vérifier que le post existe
    const post = await postRepository.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 },
      );
    }

    // Vérifier les permissions
    if (currentUser.role !== "ADMIN" && post.authorId !== currentUser.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer cet article" },
        { status: 403 },
      );
    }

    // Supprimer le post
    await postRepository.delete(id);

    return NextResponse.json({
      message: "Article supprimé avec succès",
    });
  } catch (error) {
    return handleError(error);
  }
}
