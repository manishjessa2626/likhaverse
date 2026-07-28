import { NextResponse } from "next/server"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"
import { uploadFile } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadFile(buffer, file.name, file.type)
    return NextResponse.json({ url })
  } catch (error) {
    return apiError(error, "Failed to upload file")
  }
}
