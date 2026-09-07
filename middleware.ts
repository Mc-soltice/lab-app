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

/**
 * Ajoute les headers de sécurité essentiels à la réponse
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Strict-Transport-Security : force HTTPS
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );

  // Empêche le browser de deviner le type MIME
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Désactive le clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Protège contre le XSS
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Politique de référrer
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy (anciennement Feature Policy)
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );

  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;

  // 🔥 Optimisation : skip le décodage JWT pour les routes publiques GET
  const isPublicGet =
    method === "GET" && PUBLIC_API_GET_PREFIXES.some((p) => path.startsWith(p));

  if (isPublicGet) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Routes admin (PUT/PATCH/DELETE) nécessitent le rôle ADMIN
  const isAdminRoute =
    ADMIN_ONLY_PREFIXES.some((p) => path.startsWith(p)) &&
    ADMIN_ONLY_METHODS.has(method);

  // Toutes les autres routes non-GET nécessitent une authentification
  const requiresAuth = method !== "GET" && !path.startsWith("/api/auth");

  if (!requiresAuth && !isAdminRoute) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Décodage JWT uniquement pour les routes qui en ont besoin
  const token = await getToken({ req: request });

  if (isAdminRoute && token?.role !== "ADMIN") {
    const response = NextResponse.json(
      { error: "Accès refusé" },
      { status: 403 },
    );
    return addSecurityHeaders(response);
  }

  if (requiresAuth && !token) {
    const response = NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 },
    );
    return addSecurityHeaders(response);
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: ["/api/:path*"],
};

