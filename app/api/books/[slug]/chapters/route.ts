// app/api/books/[slug]/chapters/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth/session";
import { handleError } from "../../../../../lib/error-handler";
import { NotFoundException } from "../../../../../lib/exceptions";
import { BookChapterRepository } from "../../../../../lib/repositories/book-chapter.repository";
import { BookRepository } from "../../../../../lib/repositories/book.repository";
import { BookService } from "../../../../../lib/services/book.service";
import { CreateChapterSchema } from "../../../../../lib/validation/schemas";

const bookService = new BookService();
const bookRepository = new BookRepository();
const chapterRepository = new BookChapterRepository();

// GET /api/books/{slug}/chapters -> Liste des chapitres publiés (sans leur contenu, Principe 5)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const book = await bookRepository.findBySlug(slug);
    if (!book) throw new NotFoundException("Livre non trouvé");

    const chapters = await chapterRepository.findByBook(book.id);
    return NextResponse.json({ data: chapters });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/books/{slug}/chapters -> Ajouter un chapitre
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { slug } = await params;
    const book = await bookRepository.findBySlug(slug);
    if (!book) throw new NotFoundException("Livre non trouvé");

    const body = await req.json();
    const validated = CreateChapterSchema.parse(body);

    const chapter = await bookService.addChapter(
      book.id,
      session.user.id,
      validated,
    );

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
