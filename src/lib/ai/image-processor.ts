import sharp from "sharp"
import fs from "fs/promises"
import path from "path"
import { uploadFile } from "@/lib/storage"

const AI_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "ai")

export interface ProcessedImage {
  url: string
  thumbnailUrl: string
  width: number
  height: number
}

async function ensureUploadDir(): Promise<void> {
  try {
    await fs.mkdir(AI_UPLOAD_DIR, { recursive: true })
  } catch {
    // exists
  }
}

export async function downloadAndProcessImage(
  sourceUrl: string,
  userId: string,
  generationId: string,
  options?: {
    width?: number
    height?: number
    format?: "jpeg" | "png"
  }
): Promise<ProcessedImage> {
  await ensureUploadDir()

  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  const targetWidth = options?.width ?? 600
  const targetHeight = options?.height ?? 800
  const format = options?.format ?? "jpeg"

  const timestamp = Date.now()
  const filename = `${userId}-${generationId}-${timestamp}.${format}`
  const thumbFilename = `${userId}-${generationId}-${timestamp}-thumb.${format}`

  const image = sharp(buffer)
  const metadata = await image.metadata()

  const resized = image.resize(targetWidth, targetHeight, {
    fit: "cover",
    position: "center",
  })

  let resizedBuffer: Buffer
  if (format === "jpeg") {
    resizedBuffer = await resized.jpeg({ quality: 85, mozjpeg: true }).toBuffer()
  } else {
    resizedBuffer = await resized.png({ compressionLevel: 8 }).toBuffer()
  }

  const thumbnail = sharp(buffer).resize(150, 200, {
    fit: "cover",
    position: "center",
  })

  let thumbBuffer: Buffer
  if (format === "jpeg") {
    thumbBuffer = await thumbnail.jpeg({ quality: 70 }).toBuffer()
  } else {
    thumbBuffer = await thumbnail.png({ compressionLevel: 8 }).toBuffer()
  }

  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png"

  const [url, thumbnailUrl] = await Promise.all([
    uploadFile(resizedBuffer, `uploads/ai/${filename}`, mimeType),
    uploadFile(thumbBuffer, `uploads/ai/${thumbFilename}`, mimeType),
  ])

  return {
    url,
    thumbnailUrl,
    width: metadata.width ?? targetWidth,
    height: metadata.height ?? targetHeight,
  }
}
