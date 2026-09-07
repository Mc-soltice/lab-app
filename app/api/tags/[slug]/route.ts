// app/api/tags/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "../../../../lib/error-handler";
import { TagService } from "../../../../lib/services/tag.service";

const tagService = new TagService();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const tag = await tagService.getTagBySlug(slug);
    return NextResponse.json(tag);
  } catch (error) {
    return handleError(error);
  }
}
