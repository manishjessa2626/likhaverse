import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDashboardStats } from "@/app/actions/admin"
import { AdminDashboardClient } from "./AdminDashboardClient"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) redirect("/login")

  const stats = await getDashboardStats()
  return <AdminDashboardClient stats={stats} isSuperAdmin={session.user.role === "SUPER_ADMIN"} />
}
