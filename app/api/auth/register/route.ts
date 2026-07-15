// app/api/auth/register/route.ts
import { hash } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "../../../../lib/error-handler";
import { prisma } from "../../../../lib/prisma/client";
import { UserService } from "../../../../lib/services/user.service";
import { RegisterSchema } from "../../../../lib/validation/schemas";

const userService = new UserService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation avec Zod
    const validated = RegisterSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 },
      );
    }

    // Vérifier si le username existe déjà
    const existingUsername = await prisma.user.findUnique({
      where: { username: validated.username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Ce nom d'utilisateur est déjà pris" },
        { status: 409 },
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(validated.password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        ...validated,
        password: hashedPassword,
        role: "BLOGGER",
      },
    });

    // Ne pas renvoyer le mot de passe
    const { password: _password, ...publicUser } = user;

    return NextResponse.json(publicUser, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
