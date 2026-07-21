import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllStoriesForStudio } from "@/app/actions/ai-studio"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

const TOOLS = [
  { id: "analyze", label: "Story Analyzer", desc: "Character arcs, timelines, themes, relationships, world history", href: (id: string) => `/admin/ai-studio/analyze/${id}`, color: "from-purple-50 to-white", textColor: "text-purple-700", borderColor: "border-purple-200" },
  { id: "characters", label: "Character Sheets", desc: "Generate detailed character design sheets and profiles", href: (id: string) => `/admin/ai-studio/characters/${id}`, color: "from-pink-50 to-white", textColor: "text-pink-700", borderColor: "border-pink-200" },
  { id: "world", label: "World Builder", desc: "Cultures, geography, magic systems, history, and lore", href: (id: string) => `/admin/ai-studio/world/${id}`, color: "from-cyan-50 to-white", textColor: "text-cyan-700", borderColor: "border-cyan-200" },
  { id: "environment", label: "Environment Generator", desc: "Design locations, landscapes, interiors, and concept art", href: (id: string) => `/admin/ai-studio/environment/${id}`, color: "from-green-50 to-white", textColor: "text-green-700", borderColor: "border-green-200" },
  { id: "storyboard", label: "Storyboard Creator", desc: "Convert chapters into visual storyboard scenes", href: (id: string) => `/admin/ai-studio/storyboard/${id}`, color: "from-blue-50 to-white", textColor: "text-blue-700", borderColor: "border-blue-200" },
  { id: "trailer", label: "Trailer Generator", desc: "Scripts, storyboards, and scene sequences for trailers", href: (id: string) => `/admin/ai-studio/trailer/${id}`, color: "from-amber-50 to-white", textColor: "text-amber-700", borderColor: "border-amber-200" },
  { id: "production", label: "Film Production Pipeline", desc: "Shot lists, production breakdowns, and budget estimates", href: (id: string) => `/admin/ai-studio/production/${id}`, color: "from-red-50 to-white", textColor: "text-red-700", borderColor: "border-red-200" },
]

export default async function AIStudioPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const stories = await getAllStoriesForStudio()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <BackButton fallbackHref="/admin" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-purple-700 dark:text-zinc-100">LikhaVerse AI Studio</h1>
      <p className="mt-1 text-zinc-500">Advanced AI-powered cinematic production tools. Super Admin only.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TOOLS.map((tool) => (
          <div key={tool.id} className={`rounded-xl border bg-gradient-to-br ${tool.color} p-5 ${tool.borderColor}`}>
            <h2 className={`font-semibold ${tool.textColor}`}>{tool.label}</h2>
            <p className="mt-1 text-xs text-zinc-500">{tool.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Published Stories</h2>
        {stories.length === 0 ? (
          <p className="text-zinc-400">No published stories available.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stories.map((story) => (
              <div key={story.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-800">{story.title}</h3>
                    <p className="text-xs text-zinc-400">by {story.author.name}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {story._count.chapters} ch
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  {story.wordCount.toLocaleString()} words
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/admin/ai-studio/analyze/${story.id}`}>
                    <Button size="sm">Analyze</Button>
                  </Link>
                  <Link href={`/admin/ai-studio/characters/${story.id}`}>
                    <Button size="sm" variant="secondary">Sheets</Button>
                  </Link>
                  <Link href={`/admin/ai-studio/world/${story.id}`}>
                    <Button size="sm" variant="secondary">World</Button>
                  </Link>
                  <Link href={`/admin/ai-studio/environment/${story.id}`}>
                    <Button size="sm" variant="secondary">Environ</Button>
                  </Link>
                  <Link href={`/admin/ai-studio/storyboard/${story.id}`}>
                    <Button size="sm" variant="secondary">Board</Button>
                  </Link>
                  <Link href={`/admin/ai-studio/trailer/${story.id}`}>
                    <Button size="sm" variant="secondary">Trailer</Button>
                  </Link>
                  <Link href={`/admin/ai-studio/production/${story.id}`}>
                    <Button size="sm" variant="ghost">Production</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
