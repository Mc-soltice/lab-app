// app/api/books/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth/session";
import { handleError } from "../../../../lib/error-handler";
import { NotFoundException } from "../../../../lib/exceptions";
import { BookRepository } from "../../../../lib/repositories/book.repository";
import { BookService } from "../../../../lib/services/book.service";
import { UpdateBookSchema } from "../../../../lib/validation/schemas";

const bookService = new BookService();
const bookRepository = new BookRepository();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const book = await bookService.getBookBySlug(slug);
    return NextResponse.json(book);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    const { slug } = await params;
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const existing = await bookRepository.findBySlug(slug);
    if (!existing) throw new NotFoundException("Livre non trouvé");

    const body = await req.json();
    const validated = UpdateBookSchema.parse(body);
    const book = await bookService.updateBook(
      existing.id,
      session.user.id,
      validated,
    );

    return NextResponse.json(book);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    const { slug } = await params;
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const existing = await bookRepository.findBySlug(slug);
    if (!existing) throw new NotFoundException("Livre non trouvé");

    await bookService.deleteBook(existing.id, session.user.id);

    return NextResponse.json({ message: "Livre supprimé avec succès" });
  } catch (error) {
    return handleError(error);
  }
}
