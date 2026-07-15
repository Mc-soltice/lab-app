// app/api/notifications/read-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "../../../../lib/services/notification.service";
import { getSession } from "../../../../lib/auth/session";
import { handleError } from "../../../../lib/error-handler";

const notificationService = new NotificationService();

export async function PATCH(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await notificationService.markAllAsRead(session.user.id);
    return NextResponse.json({ message: "Toutes les notifications ont été marquées comme lues" });
  } catch (error) {
    return handleError(error);
  }
}
