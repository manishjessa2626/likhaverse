"use client"

import { useActionState } from "react"
import { upgradeToPremium } from "@/app/actions/premium"
import { Button } from "@/components/ui/Button"

export function UpgradeButton() {
  const [state, upgradeAction, pending] = useActionState(upgradeToPremium, undefined)

  return (
    <form action={upgradeAction}>
      <Button type="submit" disabled={pending} className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg">
        {pending ? "Processing..." : "Upgrade to Premium"}
      </Button>
      {state?.message && (
        <p className="mt-2 text-sm text-green-600">{state.message}</p>
      )}
    </form>
  )
}
