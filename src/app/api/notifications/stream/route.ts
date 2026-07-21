import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { eventBus } from "@/lib/realtime/event-bus"
import { createLogger } from "@/lib/observability/logger"

const log = createLogger("sse")

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const userId = session.user.id

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", userId })}\n\n`))

      const onNotification = (event: any) => {
        if (event.userId === userId) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
      }

      const onMessage = (event: any) => {
        if (event.userIds?.includes(userId)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
      }

      const onPresence = (event: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      const onLiveSession = (event: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      eventBus.on("notification", onNotification)
      eventBus.on("message", onMessage)
      eventBus.on("presence", onPresence)
      eventBus.on("live-session", onLiveSession)

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"))
        } catch {
          clearInterval(keepAlive)
        }
      }, 30000)

      req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive)
        eventBus.off("notification", onNotification)
        eventBus.off("message", onMessage)
        eventBus.off("presence", onPresence)
        eventBus.off("live-session", onLiveSession)
        log.info({ userId }, "SSE connection closed")
      })

      log.info({ userId }, "SSE connection opened")
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
