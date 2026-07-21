import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SECURITY_HEADERS: Record<string, string> = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => response.headers.set(key, value))
  response.headers.set("X-Request-Id", crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
