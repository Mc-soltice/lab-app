// app/api/tags/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "../../../lib/error-handler";
import { TagService } from "../../../lib/services/tag.service";
import { CreateTagSchema } from "../../../lib/validation/schemas";

const tagService = new TagService();

export async function GET() {
  try {
    const tags = await tagService.listTags();
    return NextResponse.json({ data: tags });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateTagSchema.parse(body);
    const tag = await tagService.createTag(validated);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
