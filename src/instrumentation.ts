export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { initSentry } = await import("@/lib/observability/sentry")
      await initSentry()
    } catch {
      // Sentry initialization failed — non-critical
    }
  }
}
