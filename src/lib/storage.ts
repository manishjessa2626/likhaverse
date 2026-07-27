import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import os from "os"

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(os.tmpdir(), "likhaverse-uploads")

export async function uploadFile(
  buffer: Buffer,
  storagePath: string,
  _contentType: string
): Promise<string> {
  const fullPath = path.join(UPLOAD_DIR, storagePath)
  const dir = path.dirname(fullPath)
  try {
    await mkdir(dir, { recursive: true })
  } catch (err) {
    throw new Error(`Cannot create directory ${dir}: ${err instanceof Error ? err.message : err}`)
  }
  try {
    await writeFile(fullPath, buffer)
  } catch (err) {
    throw new Error(`Cannot write file ${fullPath}: ${err instanceof Error ? err.message : err}`)
  }
  return `/api/uploads/${path.basename(storagePath)}`
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return
  const apiPrefix = "/api/uploads/"
  const localPath = fileUrl.startsWith(apiPrefix) ? fileUrl.slice(apiPrefix.length) : fileUrl
  try {
    await unlink(path.join(UPLOAD_DIR, localPath))
  } catch {}
}
