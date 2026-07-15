// app/api/categories/[slug]/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "../../../../../lib/error-handler";
import { CategoryService } from "../../../../../lib/services/category.service";
import { PaginationSchema } from "../../../../../lib/validation/schemas";

const categoryService = new CategoryService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const url = new URL(req.url);
    const { page, limit } = PaginationSchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const result = await categoryService.getCategoryPosts(slug, page, limit);

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
