// app/api/books/route.ts
import type { CreateBookDto } from "@/types/book";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth/session";
import { handleError } from "../../../lib/error-handler";
import { BookService } from "../../../lib/services/book.service";
import { CreateBookSchema } from "../../../lib/validation/schemas";

const bookService = new BookService();

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const body = await req.json();
    const validated: CreateBookDto = CreateBookSchema.parse(body);
    const book = await bookService.createBook(session.user.id, validated);
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
