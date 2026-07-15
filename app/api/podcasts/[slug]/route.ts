// app/api/podcasts/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth/session";
import { handleError } from "../../../../lib/error-handler";
import { NotFoundException } from "../../../../lib/exceptions";
import { PodcastRepository } from "../../../../lib/repositories/podcast.repository";
import { PodcastService } from "../../../../lib/services/podcast.service";
import { UpdatePodcastSchema } from "../../../../lib/validation/schemas";

const podcastService = new PodcastService();
const podcastRepository = new PodcastRepository();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const podcast = await podcastService.getPodcastBySlug(slug);
    return NextResponse.json(podcast);
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

    const existing = await podcastRepository.findBySlug(params.slug);
    if (!existing) throw new NotFoundException("Podcast non trouvé");

    const body = await req.json();
    const validated = UpdatePodcastSchema.parse(body);
    const podcast = await podcastService.updatePodcast(
      existing.id,
      session.user.id,
      validated,
    );

    return NextResponse.json(podcast);
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

    const existing = await podcastRepository.findBySlug(slug);
    if (!existing) throw new NotFoundException("Podcast non trouvé");

    await podcastService.deletePodcast(existing.id, session.user.id);

    return NextResponse.json({ message: "Podcast supprimé avec succès" });
  } catch (error) {
    return handleError(error);
  }
}
