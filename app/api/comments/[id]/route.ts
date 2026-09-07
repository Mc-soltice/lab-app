// app/api/comments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth/session";
import { handleError } from "../../../../lib/error-handler";
import { CommentService } from "../../../../lib/services/comment.service";
import { CreateCommentSchema } from "../../../../lib/validation/schemas";

const commentService = new CommentService();

export async function PATCH(
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
    const { content } = CreateCommentSchema.parse(body);

    const comment = await commentService.updateComment(
      id,
      session.user.id,
      content,
    );
    return NextResponse.json(comment);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    await commentService.deleteComment(id, session.user.id);
    return NextResponse.json({ message: "Commentaire supprimé avec succès" });
  } catch (error) {
    return handleError(error);
  }
}
