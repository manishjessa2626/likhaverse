import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"

export async function uploadFile(
  buffer: Buffer,
  storagePath: string,
  _contentType: string
): Promise<string> {
  const fullPath = path.join(process.cwd(), "public", storagePath)
  await mkdir(path.dirname(fullPath), { recursive: true })
  await writeFile(fullPath, buffer)
  return `/${storagePath}`
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return
  const localPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl
  try {
    await unlink(path.join(process.cwd(), "public", localPath))
  } catch {}
}
