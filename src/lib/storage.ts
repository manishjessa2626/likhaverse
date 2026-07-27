import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"

export async function uploadFile(
  buffer: Buffer,
  storagePath: string,
  _contentType: string
): Promise<string> {
  const publicDir = path.join(process.cwd(), "public")
  const fullPath = path.join(publicDir, storagePath)
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
  return `/${storagePath}`
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return
  const localPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl
  try {
    await unlink(path.join(process.cwd(), "public", localPath))
  } catch {}
}
