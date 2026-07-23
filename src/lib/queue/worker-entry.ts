import { startWorker, registerHandler, JobType } from "./index"
import { prisma } from "../prisma"
import { eventBus } from "../realtime/event-bus"
import { createLogger } from "../observability/logger"

const log = createLogger("worker-entry")

log.info("Queue worker starting...")

registerHandler(JobType.SEND_EMAIL, async (job) => {
  const { to, subject, html } = job.data as { to: string; subject: string; html: string }

  if (process.env.NODE_ENV === "development") {
    log.info({ to, subject }, "Email would be sent (dev mode)")
    return
  }

  const { default: nodemailer } = await import("nodemailer")
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({ from: process.env.SMTP_FROM || "noreply@likhaverse.com", to, subject, html })
  log.info({ to, subject }, "Email sent")
})

registerHandler(JobType.NOTIFICATION_PUSH, async (job) => {
  const { userId, notification } = job.data as {
    userId: string
    notification: { id: string; type: string; message: string; link?: string; actorId?: string; createdAt: string }
  }

  eventBus.broadcast({
    type: "notification",
    userId,
    notification: {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      link: notification.link || null,
      actorId: notification.actorId || null,
      createdAt: notification.createdAt,
    },
  })

  log.info({ userId, type: notification.type }, "Notification pushed via queue")
})

registerHandler(JobType.CLEANUP_EXPIRED, async () => {
  const { count: rateLimits } = await prisma.rateLimit.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
  const { count: idempotencyKeys } = await prisma.idempotencyKey.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })

  log.info({ rateLimits, idempotencyKeys }, "Cleanup completed")
})

registerHandler(JobType.SYNC_FIRESTORE, async (job) => {
  const { model, id, userId, type, message } = job.data as Record<string, any>

  if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === "demo") {
    return
  }

  try {
    const { doc, setDoc, getFirestore } = await import("firebase/firestore")
    const { initializeApp, getApps } = await import("firebase/app")
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCz7XixcIPTMfSB-phzyimax21gjLix1Og",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "likhaverse.firebaseapp.com",
      projectId: process.env.FIREBASE_PROJECT_ID || "likhaverse",
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    const db = getFirestore(app)

    if (model === "notification") {
      await setDoc(doc(db, "notifications", id), { userId, type, message, read: false, createdAt: new Date().toISOString() })
    }
  } catch (err) {
    log.warn({ err, model, id }, "Firestore sync failed (non-critical)")
  }
})

const worker = startWorker()

if (worker) {
  process.on("SIGTERM", async () => {
    log.info("Shutting down worker...")
    await worker.close()
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on("SIGINT", async () => {
    log.info("Shutting down worker...")
    await worker.close()
    await prisma.$disconnect()
    process.exit(0)
  })
} else {
  log.warn("Redis not configured — worker not started")
  process.exit(0)
}
