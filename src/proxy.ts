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

const JUNIOR_ALLOWED_STARTS = [
  "/junior", "/api/junior", "/api/uploads",
  "/api/auth", "/api/family/pin", "/api/family/pin/",
  "/api/family/junior",
  "/api/stories",
  "/_next", "/favicon", "/logo",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const juniorActive = request.cookies.get("junior_active")?.value

  if (juniorActive && pathname !== "/") {
    const isAllowed = JUNIOR_ALLOWED_STARTS.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    )

    if (!isAllowed) {
      const url = request.nextUrl.clone()
      url.pathname = `/junior/${juniorActive}/home`
      return NextResponse.redirect(url)
    }

  }

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
