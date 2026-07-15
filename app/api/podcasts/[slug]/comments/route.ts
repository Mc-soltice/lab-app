// app/api/podcasts/[slug]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth/session";
import { handleError } from "../../../../../lib/error-handler";
import { NotFoundException } from "../../../../../lib/exceptions";
import { PodcastRepository } from "../../../../../lib/repositories/podcast.repository";
import { CommentService } from "../../../../../lib/services/comment.service";
import {
  CreateCommentSchema,
  PaginationSchema,
} from "../../../../../lib/validation/schemas";

const commentService = new CommentService();
const podcastRepository = new PodcastRepository();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const podcast = await podcastRepository.findBySlug(slug);
    if (!podcast) throw new NotFoundException("Podcast non trouvé");

    const url = new URL(req.url);
    const { page, limit } = PaginationSchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const result = await commentService.getTargetComments(
      { type: "podcast", id: podcast.id },
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const podcast = await podcastRepository.findBySlug(params.slug);
    if (!podcast) throw new NotFoundException("Podcast non trouvé");

    const body = await req.json();
    const validated = CreateCommentSchema.parse(body);

    const comment = await commentService.createComment(
      { type: "podcast", id: podcast.id },
      session.user.id,
      validated,
    );

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
