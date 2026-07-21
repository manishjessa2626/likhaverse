"use client"

import { toggleSave, isSaved } from "@/app/actions/saves"
import { Button } from "@/components/ui/Button"
import { useState, useEffect, useTransition } from "react"

export function StoryActions({ storyId }: { storyId: string }) {
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    isSaved(storyId).then(setSaved)
  }, [storyId])

  function handleSave() {
    const nextSaved = !saved
    setSaved(nextSaved)
    startTransition(async () => {
      try {
        await toggleSave(storyId)
      } catch {
        setSaved(saved)
      }
    })
  }

  return (
    <Button variant={saved ? "primary" : "secondary"} size="sm" onClick={handleSave} disabled={pending}>
      {saved ? "Saved" : "Save"}
    </Button>
  )
}
