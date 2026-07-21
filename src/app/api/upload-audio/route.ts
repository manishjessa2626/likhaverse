import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadFile } from "@/lib/storage"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData: any = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm", "audio/x-m4a"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid audio file type. Supported: MP3, WAV, OGG, M4A, WEBM" }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 50MB" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split(".").pop() || "mp3"
    const storagePath = `uploads/audio/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const url = await uploadFile(buffer, storagePath, file.type)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Audio upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
