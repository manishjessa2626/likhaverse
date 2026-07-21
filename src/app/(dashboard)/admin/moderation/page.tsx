import { getModerationQueue } from "@/app/actions/admin"
import { ModerationClient } from "./ModerationClient"

export default async function AdminModerationPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const data = await getModerationQueue(Number(page) || 1)
  return <ModerationClient initialData={data} />
}
