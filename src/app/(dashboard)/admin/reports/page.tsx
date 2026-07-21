import { getReports } from "@/app/actions/admin"
import { ReportsClient } from "./ReportsClient"

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const data = await getReports(Number(page) || 1)
  return <ReportsClient initialData={data} />
}
