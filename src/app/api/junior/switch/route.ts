import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { juniorId, action } = body

    if (action === "enter") {
      if (!juniorId) {
        return NextResponse.json({ error: "juniorId required" }, { status: 400 })
      }
      const junior = await prisma.juniorProfile.findUnique({
        where: { id: juniorId },
        select: { id: true, displayName: true, avatar: true, parentUserId: true },
      })
      if (!junior || junior.parentUserId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }

      const response = NextResponse.json({ success: true, redirect: `/junior/${junior.id}/home` })
      response.cookies.set("junior_active", junior.id, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" })
      response.cookies.set("junior_name", junior.displayName, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" })
      if (junior.avatar) {
        response.cookies.set("junior_avatar", junior.avatar, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" })
      }
      return response
    }

    if (action === "exit") {
      const response = NextResponse.json({ success: true, redirect: "/" })
      response.cookies.set("junior_active", "", { path: "/", maxAge: 0 })
      response.cookies.set("junior_name", "", { path: "/", maxAge: 0 })
      response.cookies.set("junior_avatar", "", { path: "/", maxAge: 0 })
      return response
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return apiError(error, "Failed to switch mode")
  }
}
