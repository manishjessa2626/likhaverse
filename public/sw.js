const CACHE_NAME = "likhaverse-v1"
const STATIC_ASSETS = ["/", "/manifest.json", "/favicon.png", "/apple-touch-icon.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    })
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET, API, and Next.js internal requests
  if (request.method !== "GET") return
  if (url.pathname.startsWith("/api/")) return
  if (url.pathname.startsWith("/_next/")) return
  if (url.pathname.startsWith("/uploads/")) return
  if (url.hostname !== self.location.hostname) return

  // Network-first for navigation, cache-first for static assets
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    )
  } else {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone())
            return response
          })
        })
      })
    )
  }
})
