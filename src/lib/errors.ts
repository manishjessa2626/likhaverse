export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred. Please try again.",
): string {
  if (error instanceof AppError) {
    return error.message
  }
  if (process.env.NODE_ENV === "development") {
    return error instanceof Error ? error.message : String(error)
  }
  console.error("[UnexpectedError]", error instanceof Error ? error.message : error)
  return fallback
}
