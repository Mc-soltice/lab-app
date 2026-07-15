// app/api/posts/[slug]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth/session";
import { handleError } from "../../../../../lib/error-handler";
import { NotFoundException } from "../../../../../lib/exceptions";
import { PostRepository } from "../../../../../lib/repositories/post.repository";
import { InteractionService } from "../../../../../lib/services/interaction.service";
import { PaginationSchema } from "../../../../../lib/validation/schemas";

const interactionService = new InteractionService();
const postRepository = new PostRepository();

// POST /api/posts/{slug}/like -> Aimer / Retirer son like (toggle, idempotent - Principe 12)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const post = await postRepository.findBySlug(params.slug);
    if (!post) throw new NotFoundException("Publication non trouvée");

    const liked = await interactionService.toggleLike(
      { type: "post", id: post.id },
      session.user.id,
    );

    return NextResponse.json({ liked });
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/posts/{slug}/likes -> Utilisateurs ayant aimé
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const post = await postRepository.findBySlug(params.slug);
    if (!post) throw new NotFoundException("Publication non trouvée");

    const url = new URL(req.url);
    const { page, limit } = PaginationSchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? "20",
    });

    const result = await interactionService.getTargetLikes(
      { type: "post", id: post.id },
      page,
      limit,
    );

    return NextResponse.json({
      data: result.data,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
