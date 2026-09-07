// app/api/posts/[slug]/route.ts
// Note : GET est public et se fait par slug (Chapitre 3). PATCH/DELETE résolvent
// d'abord le slug en id, puis délèguent à PostService comme le README principal.
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth/session";
import { handleError } from "../../../../lib/error-handler";
import { NotFoundException } from "../../../../lib/exceptions";
import { PostRepository } from "../../../../lib/repositories/post.repository";
import { PostService } from "../../../../lib/services/post.service";
import { UpdatePostSchema } from "../../../../lib/validation/schemas";

const postService = new PostService();
const postRepository = new PostRepository();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const post = await postService.getPostBySlug(slug);
    return NextResponse.json(post);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    const { slug } = await params;
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const existing = await postRepository.findBySlug(slug);
    if (!existing) throw new NotFoundException("Article non trouvé");

    const body = await req.json();
    const validated = UpdatePostSchema.parse(body);
    const post = await postService.updatePost(existing.id, session.user.id, validated);

    return NextResponse.json(post);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    const { slug } = await params;
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const existing = await postRepository.findBySlug(slug);
    if (!existing) throw new NotFoundException("Article non trouvé");

    await postService.deletePost(existing.id, session.user.id);

    return NextResponse.json({ message: "Article supprimé avec succès" });
  } catch (error) {
    return handleError(error);
  }
}
