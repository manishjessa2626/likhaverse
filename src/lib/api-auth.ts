import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { AppError, getErrorMessage } from "./errors"
import { requireAuthor, requireAdmin, type Role } from "./permissions"
import { createLogger } from "./observability/logger"
import { captureError } from "./observability/sentry"

const log = createLogger("api-auth")

export async function getSessionOrThrow() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new AppError("Not authenticated", 401)
  }
  return session as { user: { id: string; name: string; email: string; role: string } }
}

export function apiError(error: unknown, fallback = "An unexpected error occurred.") {
  const message = getErrorMessage(error, fallback)
  const status = error instanceof AppError ? error.statusCode : 500

  if (status >= 500) {
    captureError(error, { status, fallback }).catch(() => {})
    log.error({ err: error, status }, message)
  } else {
    log.warn({ err: error, status }, message)
  }

  return NextResponse.json({ error: message }, { status })
}

export async function apiRequireAuthor() {
  const session = await getServerSession(authOptions)
  return requireAuthor(session)
}

export async function apiRequireAdmin() {
  const session = await getServerSession(authOptions)
  return requireAdmin(session)
}
