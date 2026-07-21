import { getUsers } from "@/app/actions/admin"
import { UsersClient } from "./UsersClient"

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const data = await getUsers(Number(page) || 1)
  return <UsersClient initialData={data} />
}
