import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdminSidebar } from "./AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login")
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN"

  return (
    <div className="flex min-h-screen bg-[#D4C5F0]">
      <AdminSidebar isSuperAdmin={isSuperAdmin} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
