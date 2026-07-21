import { createLogger } from "../observability/logger"

const log = createLogger("retry")

export interface RetryOptions {
  maxAttempts?: number
  baseDelayMs?: number
  maxDelayMs?: number
  jitter?: boolean
  retryOn?: (error: unknown) => boolean
  onRetry?: (error: unknown, attempt: number) => void
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true,
  retryOn: () => true,
  onRetry: () => {},
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const opts = { ...defaultOptions, ...options }

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === opts.maxAttempts || !opts.retryOn(error)) {
        throw error
      }

      opts.onRetry(error, attempt)

      const delay = calculateDelay(attempt, opts)
      log.warn({ attempt, delay, err: error }, `Retry attempt ${attempt}/${opts.maxAttempts}`)
      await sleep(delay)
    }
  }

  throw new Error("Unreachable")
}

function calculateDelay(attempt: number, opts: Required<RetryOptions>): number {
  const exponential = Math.min(
    opts.baseDelayMs * Math.pow(2, attempt - 1),
    opts.maxDelayMs,
  )

  if (!opts.jitter) return exponential

  return exponential * (0.5 + Math.random() * 0.5)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  fallback?: T,
): Promise<T> {
  try {
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs),
      ),
    ])
    return result
  } catch (error) {
    if (fallback !== undefined) {
      log.warn({ timeoutMs, err: error }, "Operation timed out, using fallback")
      return fallback
    }
    throw error
  }
}
