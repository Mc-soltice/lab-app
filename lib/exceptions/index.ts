// lib/exceptions/index.ts
export class AppException extends Error {
  public statusCode: number;
  public errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export class BadRequestException extends AppException {
  constructor(message: string) {
    super(message, 400, "BAD_REQUEST");
  }
}

export class NotFoundException extends AppException {
  constructor(message: string) {
    super(message, 404, "NOT_FOUND");
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string) {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string) {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ValidationException extends AppException {
  public details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 422, "VALIDATION_ERROR");
    this.details = details;
  }
}
