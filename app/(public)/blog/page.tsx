import ArticleCard from "@/components/ui/ArticleCard";
import PostFeedClient from "@/components/ui/PostFeedClient";
import { getSession } from "@/lib/auth/session";
import { FeedService } from "@/lib/services/feed.service";
import { Suspense } from "react";

interface HomePageProps {
  searchParams?: Promise<{ page?: string }>;
}

function LoadingFeed() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <ArticleCard key={i} isLoading />
      ))}
    </div>
  );
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
        <p className="text-red-400 text-lg">
          Erreur lors du chargement du feed
        </p>
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
      <main className="max-w-7xl mx-auto px-2 py-8 sm:px-4 lg:px-6">
        <Suspense fallback={<LoadingFeed />}>
          <FeedContent page={page} />
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error("Error in Home page:", error);
    return (
      <main className="max-w-7xl mx-auto px-2 py-4 sm:px-4 lg:px-6">
        <div className="text-center py-12">
          <p className="text-red-400 text-lg">
            Erreur lors du chargement de la page
          </p>
          <p className="text-neutral-500 mt-2">Veuillez réessayer plus tard</p>
        </div>
      </main>
    );
  }
}
