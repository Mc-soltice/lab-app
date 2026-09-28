// app/(user)/post/page.tsx
import ArticleCard from "@/components/blog/post/ArticleCard";
import PostFeedClient from "@/components/blog/post/PostFeedClient";
import { getSession } from "@/lib/auth/session";
import { FeedService } from "@/lib/services/feed.service";

// Cette route lit l'URL côté serveur (pagination), elle doit rester dynamique.
export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: Promise<{ page?: string }>;
}

async function FeedContent({ page }: { page: number }) {
  const feedService = new FeedService();
  const limit = 10;

  const session = await getSession();
  const currentUserId = session?.user?.id;

  try {
    const feed = await feedService.getMainFeed(currentUserId, page, limit);

    return (
      <PostFeedClient
        initialFeed={feed.data}
        currentUserId={currentUserId}
        page={page}
        totalPages={feed.pagination.totalPages}
        total={feed.pagination.total}
      />
    );
  } catch (error) {
    console.error("Error loading feed:", error);
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">Erreur lors du chargement du feed</p>
        <p className="text-neutral-500 mt-2">Veuillez réessayer plus tard</p>
      </div>
    );
  }
}

export default async function Home({ searchParams }: HomePageProps) {
  try {
    // ✅ Attendre et parser searchParams
    const params = await searchParams;

    // Parser le numéro de page avec validation
    let page = 1;
    if (params?.page) {
      const parsed = parseInt(params.page);
      if (!isNaN(parsed) && parsed > 0) {
        page = parsed;
      }
    }

    return (
      <main className="container mx-auto px-4 py-4">
        <FeedContent page={page} />
      </main>
    );
  } catch (error) {
    console.error("Error in Home page:", error);
    return (
      <main className="container mx-auto px-4 py-4">
        <div className="text-center py-12">
          <p className="text-red-400 text-lg">Erreur lors du chargement de la page</p>
          <p className="text-neutral-500 mt-2">Veuillez réessayer plus tard</p>
        </div>
      </main>
    );
  }
}
