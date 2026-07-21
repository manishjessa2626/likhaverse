import { getAdminStories } from "@/app/actions/admin"
import { StoriesClient } from "./StoriesClient"

export default async function AdminStoriesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const data = await getAdminStories(Number(page) || 1)
  return <StoriesClient initialData={data} />
}
