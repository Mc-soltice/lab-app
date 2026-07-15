// app/api/books/[slug]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth/session";
import { handleError } from "../../../../../lib/error-handler";
import { NotFoundException } from "../../../../../lib/exceptions";
import { BookRepository } from "../../../../../lib/repositories/book.repository";
import { InteractionService } from "../../../../../lib/services/interaction.service";

const interactionService = new InteractionService();
const bookRepository = new BookRepository();

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    const { slug } = await params;
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const book = await bookRepository.findBySlug(slug);
    if (!book) throw new NotFoundException("Livre non trouvé");

    const liked = await interactionService.toggleLike(
      { type: "book", id: book.id },
      session.user.id,
    );

    return NextResponse.json({ liked });
  } catch (error) {
    return handleError(error);
  }
}
