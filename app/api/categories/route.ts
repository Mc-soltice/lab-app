// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "../../../lib/error-handler";
import { CategoryService } from "../../../lib/services/category.service";
import { CreateCategorySchema } from "../../../lib/validation/schemas";

const categoryService = new CategoryService();

// GET /api/categories -> Liste des catégories (public)
export async function GET() {
  try {
    const categories = await categoryService.listCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/categories -> Créer une catégorie depuis le formulaire de post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateCategorySchema.parse(body);
    const category = await categoryService.createCategory(validated);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
