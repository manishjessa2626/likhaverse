import { getStaff } from "@/app/actions/admin"
import { UserCog } from "lucide-react"

export default async function AdminStaffPage() {
  const staff = await getStaff()

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><UserCog size={20} /> Staff</h1>
        <p className="mt-1 text-sm text-zinc-500">{staff.length} staff members</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-purple-200/60 dark:border-zinc-700/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-purple-50/70 dark:bg-zinc-800/70">
            <tr>
              <th className="px-3 py-2.5 font-semibold text-zinc-600 dark:text-zinc-400">Name</th>
              <th className="px-3 py-2.5 font-semibold text-zinc-600 dark:text-zinc-400">Email</th>
              <th className="px-3 py-2.5 font-semibold text-zinc-600 dark:text-zinc-400">Role</th>
              <th className="px-3 py-2.5 font-semibold text-zinc-600 dark:text-zinc-400">Member Since</th>
              <th className="px-3 py-2.5 font-semibold text-zinc-600 dark:text-zinc-400">Stories</th>
              <th className="px-3 py-2.5 font-semibold text-zinc-600 dark:text-zinc-400">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100/60 dark:divide-zinc-700/50">
            {staff.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-zinc-400">No staff found</td></tr>
            ) : (
              staff.map((user) => (
                <tr key={user.id} className="hover:bg-purple-50/30 dark:hover:bg-zinc-800/30">
                  <td className="px-3 py-2.5 font-medium text-zinc-800 dark:text-zinc-200">{user.name}</td>
                  <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      user.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2.5 text-zinc-700 dark:text-zinc-300">{user._count.stories}</td>
                  <td className="px-3 py-2.5 text-zinc-700 dark:text-zinc-300">{user._count.comments}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
