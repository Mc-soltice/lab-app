// app/api/posts/route.ts
import type { CreatePostDto } from "@/types/post";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth/session";
import { handleError } from "../../../lib/error-handler";
import { PostService } from "../../../lib/services/post.service";
import { CreatePostSchema, PaginationSchema } from "../../../lib/validation/schemas";

const postService = new PostService();

// GET /api/posts?page=&limit= -> Feed (Chapitre 3 : GET /feed)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const url = new URL(req.url);
    const { page, limit } = PaginationSchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const result = await postService.getFeed(session?.user?.id, page, limit);

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

// POST /api/posts -> Créer un article
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const validated: CreatePostDto = CreatePostSchema.parse(body);
    const post = await postService.createPost(session.user.id, validated);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
