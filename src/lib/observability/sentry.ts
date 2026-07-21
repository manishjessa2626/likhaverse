let SentryModule: any = null

async function getSentry() {
  if (SentryModule) return SentryModule
  try {
    SentryModule = await import("@sentry/nextjs")
  } catch {
    SentryModule = { captureException: null, captureMessage: null, setUser: null, init: null }
  }
  return SentryModule
}

export async function initSentry() {
  if (!process.env.SENTRY_DSN) return
  const Sentry = await getSentry()
  if (!Sentry.init) return

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    ignoreErrors: ["NEXT_REDIRECT", "NEXT_NOT_FOUND", "AbortError"],
  })
}

export async function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) {
    console.error("[Sentry]", error instanceof Error ? error.message : error, context)
    return
  }
  const Sentry = await getSentry()
  if (Sentry.captureException) {
    Sentry.captureException(error, { extra: context })
  }
}

export async function captureMessage(message: string, level: string = "info") {
  if (!process.env.SENTRY_DSN) return
  const Sentry = await getSentry()
  if (Sentry.captureMessage) {
    Sentry.captureMessage(message, level)
  }
}

export { getSentry as Sentry }
