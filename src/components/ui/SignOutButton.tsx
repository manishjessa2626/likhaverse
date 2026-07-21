"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      onClick={async () => { await signOut({ redirect: false }); window.location.href = "/" }}
      className="text-sm text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
    >
      Sign Out
    </button>
  )
}
