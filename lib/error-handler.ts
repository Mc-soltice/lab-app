// lib/error-handler.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppException } from "./exceptions";

export function handleError(error: unknown): NextResponse {
  if (error instanceof AppException) {
    return NextResponse.json(
      {
        statusCode: error.statusCode,
        error: error.errorCode,
        message: error.message,
        details: (error as { details?: unknown }).details,
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        statusCode: 422,
        error: "VALIDATION_ERROR",
        message: "Données invalides",
        details: error.flatten(),
      },
      { status: 422 },
    );
  }

  console.error("Erreur non gérée:", error);
  return NextResponse.json(
    {
      statusCode: 500,
      error: "INTERNAL_ERROR",
      message: "Une erreur interne est survenue",
    },
    { status: 500 },
  );
}
