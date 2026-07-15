// app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth/session";
import { handleError } from "../../../../../lib/error-handler";
import { NotificationService } from "../../../../../lib/services/notification.service";

const notificationService = new NotificationService();

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await notificationService.markAsRead(id, session.user.id);
    return NextResponse.json({ message: "Notification marquée comme lue" });
  } catch (error) {
    return handleError(error);
  }
}
