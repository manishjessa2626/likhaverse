import { storage } from "./firebase"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { getApps } from "firebase/app"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"

function isFirebaseConfigured() {
  return getApps().length > 0 && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo"
}

export async function uploadFile(
  buffer: Buffer,
  storagePath: string,
  contentType: string
): Promise<string> {
  if (isFirebaseConfigured()) {
    const storageRef = ref(storage, storagePath)
    await uploadBytes(storageRef, buffer, { contentType })
    return getDownloadURL(storageRef)
  }

  const fullPath = path.join(process.cwd(), "public", storagePath)
  await mkdir(path.dirname(fullPath), { recursive: true })
  await writeFile(fullPath, buffer)
  return `/${storagePath}`
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return
  if (isFirebaseConfigured()) {
    try {
      const storageRef = ref(storage, fileUrl)
      await deleteObject(storageRef)
    } catch {}
    return
  }
  const localPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl
  try {
    await unlink(path.join(process.cwd(), "public", localPath))
  } catch {}
}
