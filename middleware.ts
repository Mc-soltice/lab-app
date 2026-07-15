// middleware.ts
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes API publiques (lecture) : pas de session requise.
// Les vérifications d'auteur/admin fines restent faites dans chaque route (403 ciblé),
// ce middleware ne fait que le filtrage grossier public / authentifié / admin.
const PUBLIC_API_GET_PREFIXES = [
  "/api/posts",
  "/api/podcasts",
  "/api/books",
  "/api/categories",
  "/api/tags",
  "/api/search",
  "/api/users",
  "/api/auth",
];

const ADMIN_ONLY_PREFIXES = ["/api/categories"];
const ADMIN_ONLY_METHODS = new Set(["PUT", "PATCH", "DELETE"]);

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;
  const method = request.method;

  const isAdminRoute =
    ADMIN_ONLY_PREFIXES.some((p) => path.startsWith(p)) &&
    ADMIN_ONLY_METHODS.has(method);

  if (isAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const isPublicGet =
    method === "GET" && PUBLIC_API_GET_PREFIXES.some((p) => path.startsWith(p));

  const isMutation = method !== "GET";
  const requiresAuth = isMutation && !path.startsWith("/api/auth");

  if (requiresAuth && !token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
