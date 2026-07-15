// app/api/me/bookmarks/route.ts (vérification)
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth/session";
import { handleError } from "../../../../lib/error-handler";
import { BookmarkService } from "../../../../lib/services/bookmark.service";
import { PaginationSchema } from "../../../../lib/validation/schemas";

const bookmarkService = new BookmarkService();

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const url = new URL(req.url);
    const { page, limit } = PaginationSchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const result = await bookmarkService.getUserBookmarks(
      session.user.id,
      page,
      limit,
    );

    // S'assurer que les données incluent les informations nécessaires
    const formattedData = result.data.map((bookmark) => ({
      id: bookmark.id,
      createdAt: bookmark.createdAt,
      post: bookmark.post
        ? {
            id: bookmark.post.id,
            title: bookmark.post.title,
            slug: bookmark.post.slug,
            coverImage: bookmark.post.coverImage,
            authorId: bookmark.post.authorId,
            // Ajouter d'autres champs nécessaires
          }
        : null,
      podcast: bookmark.podcast
        ? {
            id: bookmark.podcast.id,
            title: bookmark.podcast.title,
            slug: bookmark.podcast.slug,
            coverImage: bookmark.podcast.coverImage,
            authorId: bookmark.podcast.authorId,
          }
        : null,
      book: bookmark.book
        ? {
            id: bookmark.book.id,
            title: bookmark.book.title,
            slug: bookmark.book.slug,
            coverImage: bookmark.book.coverImage,
            authorId: bookmark.book.authorId,
          }
        : null,
    }));

    return NextResponse.json({
      data: formattedData,
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
