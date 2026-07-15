import { NextRequest } from "next/server";

// types/next.ts
export type RouteParams<T extends Record<string, string>> = {
  params: Promise<T>;
};

// Types spécifiques
export type UsernameRouteParams = RouteParams<{ username: string }>;

// Utilisation dans les routes
export async function GET(req: NextRequest, { params }: UsernameRouteParams) {
  const { username } = await params;
  // ...
}
