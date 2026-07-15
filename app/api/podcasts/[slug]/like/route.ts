// app/api/podcasts/[slug]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth/session";
import { handleError } from "../../../../../lib/error-handler";
import { NotFoundException } from "../../../../../lib/exceptions";
import { PodcastRepository } from "../../../../../lib/repositories/podcast.repository";
import { InteractionService } from "../../../../../lib/services/interaction.service";

const interactionService = new InteractionService();
const podcastRepository = new PodcastRepository();

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    const { slug } = await params;
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const podcast = await podcastRepository.findBySlug(slug);
    if (!podcast) throw new NotFoundException("Podcast non trouvé");

    const liked = await interactionService.toggleLike(
      { type: "podcast", id: podcast.id },
      session.user.id,
    );

    return NextResponse.json({ liked });
  } catch (error) {
    return handleError(error);
  }
}
