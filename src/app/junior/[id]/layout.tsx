import type { ReactNode } from "react"
import { JuniorSidebar } from "@/components/junior/JuniorSidebar"

export default function JuniorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-orange-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
      <JuniorSidebar />
      <main className="md:ml-56 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
