// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "../../../lib/services/search.service";
import { SearchSchema } from "../../../lib/validation/schemas";
import { handleError } from "../../../lib/error-handler";

const searchService = new SearchService();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params = SearchSchema.parse({
      q: url.searchParams.get("q") ?? "",
      type: url.searchParams.get("type") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const result = await searchService.search(params);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
