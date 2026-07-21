import { NextResponse } from "next/server"
import { getSessionOrThrow, apiError } from "@/lib/api-auth"
import { uploadFile } from "@/lib/storage"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024

const MAGIC_BYTES: Record<string, Uint8Array> = {
  "image/jpeg": new Uint8Array([0xFF, 0xD8, 0xFF]),
  "image/png": new Uint8Array([0x89, 0x50, 0x4E, 0x47]),
  "image/webp": new Uint8Array([0x52, 0x49, 0x46, 0x46]),
  "image/gif": new Uint8Array([0x47, 0x49, 0x46, 0x38]),
}

function checkMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  const magic = MAGIC_BYTES[mimeType]
  if (!magic) return false
  if (buffer.length < magic.length) return false
  for (let i = 0; i < magic.length; i++) {
    if (buffer[i] !== magic[i]) return false
  }
  return true
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()

    const formData: any = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (!checkMagicBytes(new Uint8Array(bytes), file.type)) {
      return NextResponse.json({ error: "File content does not match declared type." }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${session.user.id}-${Date.now()}.${ext}`
    const storagePath = `uploads/${filename}`

    const url = await uploadFile(buffer, storagePath, file.type)

    return NextResponse.json({ url })
  } catch (error) {
    return apiError(error, "Upload failed")
  }
}
