// app/api/search/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PostService } from "../../../../lib/services/post.service";
import { SearchSchema } from "../../../../lib/validation/schemas";
import { handleError } from "../../../../lib/error-handler";

const postService = new PostService();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { q, page, limit } = SearchSchema.parse({
      q: url.searchParams.get("q") ?? "",
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const result = await postService.searchPosts(q, page, limit);

    return NextResponse.json({
      data: result.data,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    });
  } catch (error) {
    return handleError(error);
  }
}
