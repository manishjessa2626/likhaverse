import Link from "next/link"

interface CinemaCardProps {
  story: {
    id: string
    title: string
    cover: string | null
    tags: string | null
    viewCount?: number
    author: { id: string; name: string; role?: string }
    _count: { chapters: number; saves?: number }
  }
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="absolute left-1.5 top-1.5 z-10 rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-lg"
      style={{
        color,
        background: `${color}22`,
        boxShadow: `0 0 8px ${color}33`,
      }}
    >
      {label}
    </span>
  )
}

function getBadges(story: CinemaCardProps["story"]): { label: string; color: string }[] {
  const badges: { label: string; color: string }[] = []
  if ((story.viewCount ?? 0) > 50) badges.push({ label: "🔥 Hot", color: "#f97316" })
  else if ((story._count.saves ?? 0) > 5) badges.push({ label: "⭐ Top", color: "#eab308" })
  if (story.tags) {
    const tag = story.tags.split(",")[0].trim().toLowerCase()
    if (tag === "drama") badges.push({ label: "💔 Drama", color: "#ec4899" })
    else if (tag === "romance") badges.push({ label: "💕 Romance", color: "#f43f5e" })
    else if (tag === "fantasy") badges.push({ label: "✨ Fantasy", color: "#a855f7" })
    else if (tag === "horror") badges.push({ label: "👻 Horror", color: "#6b7280" })
    else if (tag === "comedy") badges.push({ label: "😂 Comedy", color: "#eab308" })
  }
  return badges.slice(0, 2)
}

export function CinemaCard({ story }: CinemaCardProps) {
  const badges = getBadges(story)

  return (
    <Link
      href={"/stories/" + story.id}
      className="group flex-shrink-0 w-44 snap-start"
    >
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 relative transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-violet-900/20">
        {badges.map((b) => (
          <Badge key={b.label} label={b.label} color={b.color} />
        ))}
        {story.cover ? (
          <img src={story.cover} alt={story.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-4xl font-bold text-zinc-700">{story.title.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-xs text-zinc-300 line-clamp-2">{story.author.name}</p>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-semibold text-zinc-100 line-clamp-1 leading-tight">{story.title}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs text-zinc-500">{story._count.chapters} ch.</span>
          {story.tags && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 truncate max-w-20">
              {story.tags.split(",")[0].trim()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
