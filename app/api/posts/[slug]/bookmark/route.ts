// app/api/posts/[slug]/bookmark/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth/session";
import { handleError } from "../../../../../lib/error-handler";
import { NotFoundException } from "../../../../../lib/exceptions";
import { PostRepository } from "../../../../../lib/repositories/post.repository";
import { BookmarkService } from "../../../../../lib/services/bookmark.service";

const bookmarkService = new BookmarkService();
const postRepository = new PostRepository();

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

    const bookmarked = await bookmarkService.toggleBookmark(
      { type: "post", id: post.id },
      session.user.id,
    );

    return NextResponse.json({ bookmarked });
  } catch (error) {
    return handleError(error);
  }
}
