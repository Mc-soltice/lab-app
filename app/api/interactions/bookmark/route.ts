// app/api/interactions/bookmark/route.ts
// Route générique de bookmark (Chapitre 19) : couvre post | podcast | book.
import { NextRequest, NextResponse } from "next/server";
import { BookmarkService } from "../../../../lib/services/bookmark.service";
import { getSession } from "../../../../lib/auth/session";
import { BookmarkTargetSchema } from "../../../../lib/validation/schemas";
import { handleError } from "../../../../lib/error-handler";

const bookmarkService = new BookmarkService();

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const target = BookmarkTargetSchema.parse(body);

    const bookmarked = await bookmarkService.toggleBookmark(target, session.user.id);

    return NextResponse.json({ bookmarked });
  } catch (error) {
    return handleError(error);
  }
}
