// app/api/podcasts/[slug]/bookmark/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth/session";
import { handleError } from "../../../../../lib/error-handler";
import { NotFoundException } from "../../../../../lib/exceptions";
import { PodcastRepository } from "../../../../../lib/repositories/podcast.repository";
import { BookmarkService } from "../../../../../lib/services/bookmark.service";

const bookmarkService = new BookmarkService();
const podcastRepository = new PodcastRepository();

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { slug } = await params;
    const podcast = await podcastRepository.findBySlug(slug);
    if (!podcast) throw new NotFoundException("Podcast non trouvé");

    const bookmarked = await bookmarkService.toggleBookmark(
      { type: "podcast", id: podcast.id },
      session.user.id,
    );

    return NextResponse.json({ bookmarked });
  } catch (error) {
    return handleError(error);
  }
}
