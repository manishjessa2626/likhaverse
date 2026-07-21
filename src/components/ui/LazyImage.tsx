"use client"

import { useState, useRef, useEffect } from "react"

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
}

export function LazyImage({ src, alt, fallback, className = "", ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const [error, setError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const placeholder = fallback || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23272727'/%3E%3C/svg%3E"

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ minHeight: 50 }}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-zinc-800" />
      )}
      {inView && (
        <img
          src={error ? placeholder : src || placeholder}
          alt={alt || ""}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          {...props}
        />
      )}
    </div>
  )
}
