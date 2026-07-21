import { Queue, Worker, Job } from "bullmq"
import { createLogger } from "../observability/logger"
import { getRedis } from "../cache/redis"

const log = createLogger("queue")

const QUEUE_PREFIX = "likhaverse"

function getConnectionOptions() {
  const url = process.env.REDIS_URL || process.env.KV_URL
  if (!url) return null

  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname || "localhost",
      port: parseInt(parsed.port || "6379", 10),
      password: parsed.password || undefined,
      db: parsed.pathname ? parseInt(parsed.pathname.replace("/", ""), 10) || 0 : 0,
      retryStrategy: (times: number) => {
        if (times > 5) return null
        return Math.min(times * 200, 3000)
      },
    }
  } catch {
    return { host: "localhost", port: 6379 }
  }
}

function getQueueOptions() {
  const conn = getConnectionOptions()
  if (!conn) return null

  return {
    connection: conn,
    prefix: QUEUE_PREFIX,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential" as const, delay: 2000 },
      removeOnComplete: { age: 86400, count: 100 },
      removeOnFail: { age: 604800, count: 50 },
    },
  }
}

export enum JobType {
  SEND_EMAIL = "send-email",
  PROCESS_PAYMENT = "process-payment",
  AI_GENERATION = "ai-generation",
  NOTIFICATION_PUSH = "notification-push",
  SYNC_FIRESTORE = "sync-firestore",
  CLEANUP_EXPIRED = "cleanup-expired",
  BACKUP_DATABASE = "backup-database",
  INDEX_SEARCH = "index-search",
}

declare global {
  // eslint-disable-next-line no-var
  var __queues: Map<string, Queue> | undefined
}

function getQueuesMap(): Map<string, Queue> {
  if (!global.__queues) {
    global.__queues = new Map()
  }
  return global.__queues
}

function getOrCreateQueue(name: string): Queue | null {
  const opts = getQueueOptions()
  if (!opts) return null

  const map = getQueuesMap()
  if (map.has(name)) return map.get(name)!

  const queue = new Queue(name, opts)
  map.set(name, queue)
  return queue
}

export async function enqueue(
  type: JobType,
  data: Record<string, unknown>,
  opts?: { delay?: number; jobId?: string },
): Promise<string | null> {
  const queue = getOrCreateQueue(type)
  if (!queue) {
    log.warn({ type }, "Queue not available (Redis not configured) — running inline")
    return null
  }

  const job = await queue.add(type, data, {
    jobId: opts?.jobId,
    delay: opts?.delay,
  })

  log.info({ jobId: job.id, type }, "Job enqueued")
  return job.id ?? null
}

type JobHandler = (job: Job) => Promise<void>

const handlers = new Map<JobType, JobHandler>()

export function registerHandler(type: JobType, handler: JobHandler): void {
  handlers.set(type, handler)
}

export function startWorker(): Worker | null {
  const conn = getConnectionOptions()
  if (!conn) return null

  const worker = new Worker(
    "__aggregate__",
    async (job) => {
      const handler = handlers.get(job.name as JobType)
      if (handler) {
        await handler(job)
      } else {
        log.warn({ jobName: job.name }, "No handler registered for job type")
      }
    },
    {
      connection: conn,
      prefix: QUEUE_PREFIX,
      concurrency: 5,
      limiter: { max: 20, duration: 1000 },
    },
  )

  worker.on("completed", (job) => log.info({ jobId: job.id, type: job.name }, "Job completed"))
  worker.on("failed", (job, err) => log.error({ jobId: job?.id, type: job?.name, err }, "Job failed"))
  worker.on("error", (err) => log.error({ err }, "Worker error"))

  log.info("Queue worker started")
  return worker
}

export async function getQueueMetrics(type: JobType) {
  const queue = getOrCreateQueue(type)
  if (!queue) return null
  return {
    waiting: await queue.getWaitingCount(),
    active: await queue.getActiveCount(),
    completed: await queue.getCompletedCount(),
    failed: await queue.getFailedCount(),
    delayed: await queue.getDelayedCount(),
  }
}
