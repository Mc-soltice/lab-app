// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "../../../lib/services/notification.service";
import { getSession } from "../../../lib/auth/session";
import { PaginationSchema } from "../../../lib/validation/schemas";
import { handleError } from "../../../lib/error-handler";

const notificationService = new NotificationService();

// GET /api/notifications -> Mes notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const url = new URL(req.url);
    const { page, limit } = PaginationSchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? "20",
    });

    const result = await notificationService.getUserNotifications(session.user.id, page, limit);

    return NextResponse.json({
      data: result.data,
      meta: {
        page,
        limit,
        total: result.total,
        unreadCount: result.unreadCount,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
