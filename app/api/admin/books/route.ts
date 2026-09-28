// app/api/admin/books/route.ts
import { getCurrentUser } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { BookRepository } from "@/lib/repositories/book.repository";
import { NextRequest, NextResponse } from "next/server";

const bookRepository = new BookRepository();

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const where =
      currentUser.role === "ADMIN" ? {} : { authorId: currentUser.id };
    const books = await bookRepository.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Formater les livres pour le frontend
    const formattedBooks = await Promise.all(
      books.map(async (book) => {
        const stats = await bookRepository.getStats(book.id);
        return {
          ...book,
          tags: book.tags.map(({ tag }) => tag),
          likesCount: stats.likes,
          commentsCount: stats.comments,
          bookmarksCount: stats.bookmarks,
        };
      }),
    );

    return NextResponse.json(formattedBooks);
  } catch (error) {
    return handleError(error);
  }
}
