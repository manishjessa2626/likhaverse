"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

interface BackButtonProps {
  fallbackHref?: string
  href?: string
  children?: React.ReactNode
  className?: string
}

export function BackButton({
  fallbackHref = "/",
  href,
  children,
  className = "",
}: BackButtonProps) {
  const router = useRouter()
  const [hasHistory, setHasHistory] = useState(false)

  useEffect(() => {
    setHasHistory(window.history.length > 1)
  }, [])

  const handleClick = useCallback(() => {
    if (href) {
      router.push(href)
    } else if (hasHistory) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }, [href, hasHistory, fallbackHref, router])

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children || "\u2190 Back"}
    </button>
  )
}
