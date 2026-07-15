// lib/auth/guards.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./session";

type Handler = (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>;

export function withAuth(handler: Handler): Handler {
  return async (req: NextRequest, ...args: unknown[]) => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return handler(req, ...args);
  };
}

export function withAdmin(handler: Handler): Handler {
  return async (req: NextRequest, ...args: unknown[]) => {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    return handler(req, ...args);
  };
}
