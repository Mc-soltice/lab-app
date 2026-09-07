// app/api/admin/users/[id]/route.ts
import { getCurrentUser } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { UserRepository } from "@/lib/repositories/user.repository";
import { NextRequest, NextResponse } from "next/server";

const userRepository = new UserRepository();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Vérifier que l'utilisateur est admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Empêcher la suppression de son propre compte
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 },
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await userRepository.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    // Supprimer l'utilisateur
    await userRepository.delete(id);

    return NextResponse.json({
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    return handleError(error);
  }
}
