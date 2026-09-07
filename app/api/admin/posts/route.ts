// app/api/admin/posts/route.ts
import { getCurrentUser } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { PostRepository } from "@/lib/repositories/post.repository";
import { NextRequest, NextResponse } from "next/server";

const postRepository = new PostRepository();

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer tous les posts (admin peut voir tous les posts)
    // Si l'utilisateur est admin, il voit tout
    // Si c'est un auteur, il ne voit que ses posts
    let posts;
    if (currentUser.role === "ADMIN") {
      const result = await postRepository.getFeed(undefined, 1, 1000);
      posts = result.data;
    } else {
      const result = await postRepository.findByAuthorForOwner(
        currentUser.id,
        1,
        1000,
      );
      posts = result.data;
    }

    return NextResponse.json(posts);
  } catch (error) {
    return handleError(error);
  }
}
