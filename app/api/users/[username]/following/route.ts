// app/api/users/[username]/following/route.ts - CORRIGÉ
import { handleError } from "@/lib/error-handler";
import { NotFoundException } from "@/lib/exceptions";
import { UserRepository } from "@/lib/repositories/user.repository";
import { FollowService } from "@/lib/services/follow.service";
import { PaginationSchema, UsernameSchema } from "@/lib/validation/schemas";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const followService = new FollowService();
const userRepository = new UserRepository();

const UsernameParamSchema = z.object({
  username: UsernameSchema,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }, // ✅ Promise
) {
  try {
    // ✅ Attendre les params
    const { username } = await params;
    const validated = UsernameParamSchema.parse({ username });

    const user = await userRepository.findByUsername(validated.username);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    const url = new URL(req.url);
    const { page, limit } = PaginationSchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? "20",
    });

    const result = await followService.getFollowing(user.id, page, limit);

    return NextResponse.json({
      data: result.data,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("[Following API] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: error.errors },
        { status: 400 },
      );
    }
    return handleError(error);
  }
}
