import { getSubscriptions } from "@/app/actions/admin"
import { SubscriptionsClient } from "./SubscriptionsClient"

export default async function AdminSubscriptionsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const data = await getSubscriptions(Number(page) || 1)
  return <SubscriptionsClient initialData={data} />
}
