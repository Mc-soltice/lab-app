export function toError(error: unknown, fallbackMessage: string): Error {
  return error instanceof Error
    ? error
    : new Error(fallbackMessage, { cause: error });
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}
