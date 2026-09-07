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

    // Récupérer tous les livres
    // Si l'utilisateur est admin, il voit tout
    // Si c'est un auteur, il ne voit que ses livres
    let books;
    if (currentUser.role === "ADMIN") {
      const result = await bookRepository.findMany({
        where: {},
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
      books = result;
    } else {
      const result = await bookRepository.findMany({
        where: { authorId: currentUser.id },
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
      books = result;
    }

    // Formater les livres pour le frontend
    const formattedBooks = await Promise.all(
      books.map(async (book: any) => {
        const stats = await bookRepository.getStats(book.id);
        return {
          ...book,
          tags: book.tags?.map((t: any) => t.tag) || [],
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
