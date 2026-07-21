import { createLogger } from "../observability/logger"

const log = createLogger("circuit-breaker")

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN"

interface CircuitBreakerOptions {
  failureThreshold?: number
  successThreshold?: number
  timeoutMs?: number
  name?: string
}

const DEFAULT_OPTIONS: Required<CircuitBreakerOptions> = {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 30000,
  name: "unnamed",
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED"
  private failureCount = 0
  private successCount = 0
  private lastFailureTime = 0
  private options: Required<CircuitBreakerOptions>

  constructor(options?: CircuitBreakerOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  getState(): CircuitState {
    if (this.state === "OPEN" && Date.now() - this.lastFailureTime >= this.options.timeoutMs) {
      this.halfOpen()
    }
    return this.state
  }

  async execute<T>(fn: () => Promise<T>, fallback?: T): Promise<T> {
    const state = this.getState()

    if (state === "OPEN") {
      log.warn({ name: this.options.name }, "Circuit breaker OPEN — rejecting immediately")
      if (fallback !== undefined) return fallback
      throw new Error(`Circuit breaker open for ${this.options.name}`)
    }

    if (state === "HALF_OPEN") {
      log.info({ name: this.options.name }, "Circuit breaker HALF_OPEN — probing")
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      if (fallback !== undefined) return fallback
      throw error
    }
  }

  private onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.successCount++
      if (this.successCount >= this.options.successThreshold) {
        this.reset()
      }
      return
    }

    this.reset()
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.options.failureThreshold) {
      this.trip()
    }
  }

  private trip(): void {
    this.state = "OPEN"
    this.successCount = 0
    log.warn({ name: this.options.name, threshold: this.options.failureThreshold }, "Circuit breaker TRIPPED — OPEN")
  }

  private halfOpen(): void {
    this.state = "HALF_OPEN"
    this.failureCount = 0
    this.successCount = 0
    log.info({ name: this.options.name }, "Circuit breaker HALF_OPEN")
  }

  private reset(): void {
    this.state = "CLOSED"
    this.failureCount = 0
    this.successCount = 0
  }
}

const circuitStore = new Map<string, CircuitBreaker>()

export function getCircuitBreaker(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
  if (!circuitStore.has(name)) {
    circuitStore.set(name, new CircuitBreaker({ ...options, name }))
  }
  return circuitStore.get(name)!
}
