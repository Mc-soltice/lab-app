// app/api/categories/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "../../../../lib/error-handler";
import { CategoryService } from "../../../../lib/services/category.service";

const categoryService = new CategoryService();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const category = await categoryService.getCategoryBySlug(slug);
    return NextResponse.json(category);
  } catch (error) {
    return handleError(error);
  }
}
