const ttlCache = new Map<string, { data: unknown; expiry: number }>()

export function getCachedOrFetch<T>(key: string, fetch: () => Promise<T>, ttl = 30_000): Promise<T> {
  const existing = ttlCache.get(key)
  if (existing && existing.expiry > Date.now()) return Promise.resolve(existing.data as T)
  return fetch().then((data) => {
    ttlCache.set(key, { data, expiry: Date.now() + ttl })
    if (ttlCache.size > 100) {
      const now = Date.now()
      for (const [k, v] of ttlCache) {
        if (v.expiry < now) ttlCache.delete(k)
      }
    }
    return data
  })
}
