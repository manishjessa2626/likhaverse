import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Pencil, Plus, BookOpen, BarChart3, Sparkles, Lightbulb, BookText, Monitor } from "lucide-react"

function CoverPlaceholder({ title, hue }: { title: string; hue: number }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center text-center"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 40%, 15%), hsl(${(hue + 60) % 360}, 30%, 10%))`,
      }}
    >
      <span className="px-3 text-xs font-bold leading-tight text-white/70 line-clamp-4">
        {title}
      </span>
    </div>
  )
}

function Spine() {
  return (
    <div className="absolute left-0 top-0 z-10 h-full w-[7px]">
      <div className="h-full w-full bg-black/20" />
      <div className="absolute left-[3px] top-0 h-full w-[1px] bg-white/5" />
    </div>
  )
}

function PageEdges() {
  return (
    <div className="relative flex h-[5px] shrink-0">
      <div className="h-full w-full bg-zinc-300/20" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10" />
      <div className="absolute inset-x-0 top-[2px] h-[1px] bg-white/5" />
      <div className="absolute inset-x-0 top-[4px] h-[1px] bg-zinc-400/10" />
    </div>
  )
}

function RealBook({
  href,
  title,
  status,
  cover,
  hue,
  children,
}: {
  href: string
  title: string
  status?: string
  cover?: string | null
  hue: number
  children?: React.ReactNode
}) {
  const isLive = status === "PUBLISHED" || status === "COMPLETED"
  return (
    <Link
      href={href}
      className="group relative flex flex-col transition-all duration-200 hover:-translate-y-2 hover:z-10"
      style={{ filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.5))" }}
    >
      {/* Book body */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-zinc-900">
        <Spine />
        {cover ? (
          <>
            <img
              src={cover}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 pt-10">
              <h3 className="text-xs font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">{title}</h3>
            </div>
          </>
        ) : (
          <CoverPlaceholder title={title} hue={hue} />
        )}
        {status && (
          <span
            className={`absolute right-1.5 top-1.5 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
              isLive
                ? "bg-green-500/25 text-green-400"
                : status === "DRAFT"
                  ? "bg-zinc-500/25 text-zinc-400"
                  : "bg-yellow-500/25 text-yellow-400"
            }`}
          >
            {isLive ? "Published" : status}
          </span>
        )}
      </div>
      <PageEdges />
      {/* Info bar at bottom */}
      {children && (
        <div className="flex items-center gap-2 bg-zinc-900/90 px-2 py-1.5 text-[10px] text-zinc-500">
          {children}
        </div>
      )}
      {/* Shadow beneath book */}
      <div className="absolute -bottom-1 left-[5%] right-[5%] h-3 rounded-full bg-black/40 blur-sm transition-all duration-200 group-hover:left-[2%] group-hover:right-[2%] group-hover:h-4 group-hover:bg-black/60" />
    </Link>
  )
}

export default async function WritePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/write")
  }

  const [stories, stats] = await Promise.all([
    prisma.story.findMany({
      where: { authorId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        cover: true,
        wordCount: true,
        viewCount: true,
        updatedAt: true,
        _count: { select: { chapters: true } },
      },
    }),
    prisma.story.aggregate({
      where: { authorId: session.user.id },
      _sum: { wordCount: true, viewCount: true },
      _count: true,
    }),
  ])

  const publishedCount = stories.filter((s) => s.status === "PUBLISHED" || s.status === "COMPLETED").length

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* ── Section 1: Your Stories ── */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-800">📚 Your Stories</h2>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {stories.map((story) => {
              const hue = story.title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
              return (
                <RealBook
                  key={story.id}
                  href={`/write/${story.id}`}
                  title={story.title}
                  status={story.status}
                  cover={story.cover}
                  hue={hue}
                >
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} />
                    {story._count.chapters}
                  </span>
                  <span className="flex items-center gap-1">
                    <Pencil size={11} />
                    {story.wordCount.toLocaleString()}
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    <BarChart3 size={11} />
                    {story.viewCount}
                  </span>
                </RealBook>
              )
            })}

            {stories.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-14 text-zinc-500">
                <BookText size={40} className="mb-3 opacity-40" />
                <p className="mb-1 text-base font-medium text-zinc-600">Your shelf is empty</p>
                <p className="text-sm text-zinc-400">Create your first story below</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 2: Create New Story ── */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-800">➕ Create New Story</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <Link
              href="/write/new"
              className="group relative flex flex-col transition-all duration-200 hover:-translate-y-2 hover:z-10"
              style={{ filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.15))" }}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm border-2 border-dashed border-purple-300 bg-white/60">
                <Spine />
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100/80 transition-colors group-hover:bg-purple-200/80">
                    <Plus size={20} className="text-purple-500 transition-colors group-hover:text-purple-700" />
                  </div>
                  <p className="text-sm font-semibold text-purple-600 transition-colors group-hover:text-purple-800">Blank Canvas</p>
                  <p className="text-[10px] text-zinc-500">Start writing</p>
                </div>
              </div>
              <PageEdges />
              <div className="flex items-center justify-center bg-white/80 px-2 py-1.5">
                <span className="text-[10px] font-medium text-purple-500 group-hover:text-purple-700 transition-colors">Begin →</span>
              </div>
              <div className="absolute -bottom-1 left-[5%] right-[5%] h-3 rounded-full bg-purple-900/20 blur-sm transition-all duration-200 group-hover:left-[2%] group-hover:right-[2%] group-hover:h-4 group-hover:bg-purple-900/30" />
            </Link>
          </div>
        </div>

        {/* ── Section 3: Writing Tools ── */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-800">🛠 Writing Tools</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            <ToolBook href="#" hue={210} icon={<Sparkles size={20} />} title="AI Writer" desc="Generate chapters & ideas" />
            <ToolBook href="#" hue={40} icon={<Lightbulb size={20} />} title="Idea Generator" desc="Plot prompts & inspiration" />
            <ToolBook href="#" hue={280} icon={<Monitor size={20} />} title="Ambience Mode" desc="Genre-based sound & visuals" />
            <ToolBook href="#" hue={160} icon={<BookText size={20} />} title="Auto-Save" desc="Never lose your progress" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolBook({
  href,
  hue,
  icon,
  title,
  desc,
}: {
  href: string
  hue: number
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col transition-all duration-200 hover:-translate-y-2 hover:z-10"
      style={{ filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.15))" }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
        <Spine />
        <div
          className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center"
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 35%, 85%), hsl(${(hue + 50) % 360}, 25%, 90%))`,
          }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-200/50 text-purple-600 transition-colors group-hover:bg-purple-300/70 group-hover:text-purple-800">
            {icon}
          </span>
          <span className="text-sm font-bold text-zinc-800 leading-tight">{title}</span>
          <span className="text-[10px] text-zinc-500 leading-relaxed">{desc}</span>
        </div>
      </div>
      <PageEdges />
      <div className="flex items-center justify-center bg-white/80 px-2 py-1.5">
        <span className="text-[10px] font-medium text-purple-500 group-hover:text-purple-700 transition-colors">
          Open Tool →
        </span>
      </div>
      <div className="absolute -bottom-1 left-[5%] right-[5%] h-3 rounded-full bg-purple-900/20 blur-sm transition-all duration-200 group-hover:left-[2%] group-hover:right-[2%] group-hover:h-4 group-hover:bg-purple-900/30" />
    </Link>
  )
}
