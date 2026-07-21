import pino from "pino"

const isEdge = typeof process === "undefined" || process?.env?.NEXT_RUNTIME === "edge"

const logger = isEdge
  ? pino({
      browser: { asObject: true },
      level: process.env.LOG_LEVEL || "info",
    })
  : pino({
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } }
          : undefined,
      redact: {
        paths: ["req.headers.authorization", "req.headers.cookie", "body.password", "body.token", "body.secret"],
        censor: "[REDACTED]",
      },
      serializers: {
        req: (r) => ({
          method: r.method,
          url: r.url,
          headers: { "user-agent": r.headers?.["user-agent"] },
        }),
        res: (r) => ({ statusCode: r.statusCode }),
        err: pino.stdSerializers.err,
      },
    })

export function createLogger(context: string) {
  return logger.child({ context })
}

export default logger
