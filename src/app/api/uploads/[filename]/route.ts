import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import os from "os"
import { existsSync } from "fs"

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(os.tmpdir(), "likhaverse-uploads")

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params
  const safe = path.basename(filename)
  const filePath = path.join(UPLOAD_DIR, "uploads", safe)

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const ext = path.extname(safe).toLowerCase()
  const mime: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  }

  const buffer = await readFile(filePath)
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mime[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
