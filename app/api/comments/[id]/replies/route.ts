// app/api/comments/[id]/replies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth/session";
import { handleError } from "../../../../../lib/error-handler";
import { CommentService } from "../../../../../lib/services/comment.service";
import {
  CreateCommentSchema,
  PaginationSchema,
} from "../../../../../lib/validation/schemas";

const commentService = new CommentService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const { page, limit } = PaginationSchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const result = await commentService.getCommentReplies(id, page, limit);

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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = CreateCommentSchema.parse(body);

    const reply = await commentService.createReply(
      id,
      session.user.id,
      validated,
    );

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
