// app/api/podcasts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth/session";
import { handleError } from "../../../lib/error-handler";
import { PodcastService } from "../../../lib/services/podcast.service";
import {
  CreatePodcastSchema,
  ListPodcastSchema,
} from "../../../lib/validation/schemas";

const podcastService = new PodcastService();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { page, limit, search, category } = ListPodcastSchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
    });

    const result = await podcastService.getPublishedPodcasts(
      page,
      limit,
      search,
      category,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const body = await req.json();
    const validated = CreatePodcastSchema.parse(body);
    const podcast = await podcastService.createPodcast(
      session.user.id,
      validated,
    );
    return NextResponse.json(podcast, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
