import { getClassicBooks } from "@/app/actions/admin"
import { ClassicLibraryClient } from "./ClassicLibraryClient"

export default async function ClassicLibraryPage() {
  const data = await getClassicBooks(1)
  return <ClassicLibraryClient initialData={data} />
}
