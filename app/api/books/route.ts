// app/api/books/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BookService } from "../../../lib/services/book.service";
import { getSession } from "../../../lib/auth/session";
import { CreateBookSchema } from "../../../lib/validation/schemas";
import { handleError } from "../../../lib/error-handler";

const bookService = new BookService();

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const body = await req.json();
    const validated = CreateBookSchema.parse(body);
    const book = await bookService.createBook(session.user.id, validated);
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
