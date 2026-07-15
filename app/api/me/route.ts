// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { UserService } from "../../../lib/services/user.service";
import { UserRepository } from "../../../lib/repositories/user.repository";
import { getSession } from "../../../lib/auth/session";
import { UpdateProfileSchema } from "../../../lib/validation/schemas";
import { handleError } from "../../../lib/error-handler";
import { NotFoundException } from "../../../lib/exceptions";

const userService = new UserService();
const userRepository = new UserRepository();

// GET /api/me -> Mon profil
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await userRepository.findById(session.user.id);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    const { password: _password, ...profile } = user;
    return NextResponse.json(profile);
  } catch (error) {
    return handleError(error);
  }
}

// PATCH /api/me -> Modifier mon profil
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const validated = UpdateProfileSchema.parse(body);

    const user = await userService.updateProfile(session.user.id, validated);
    const { password: _password, ...profile } = user;

    return NextResponse.json(profile);
  } catch (error) {
    return handleError(error);
  }
}
