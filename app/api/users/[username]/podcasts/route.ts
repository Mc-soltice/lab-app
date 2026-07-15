import { getSession } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { PodcastService } from "@/lib/services/podcast.service";
import { PaginationSchema, UsernameSchema } from "@/lib/validation/schemas";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const podcastService = new PodcastService();

const UsernameParamSchema = z.object({
  username: UsernameSchema,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const validated = UsernameParamSchema.parse({ username });

    const url = new URL(req.url);
    const { page, limit } = PaginationSchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const session = await getSession();
    const viewerId = session?.user?.id;

    const result = await podcastService.getUserPodcastsByUsername(
      validated.username,
      viewerId,
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
    console.error("[User Podcasts API] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: error.errors },
        { status: 400 },
      );
    }

    return handleError(error);
  }
}
