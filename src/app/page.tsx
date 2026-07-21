import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getHomepageData } from "@/app/actions/homepage"
import { AnimatedHero } from "@/components/AnimatedHero"
import Footer from "@/components/layout/Footer"

const genreEmoji: Record<string, string> = {
  romance: "💕", drama: "🎭", fantasy: "✨", horror: "👻",
  "sci-fi": "🚀", comedy: "😂", mystery: "🔍", adventure: "🗺️",
  thriller: "🔪", historical: "🏛️", action: "💥", "fan fiction": "📝",
}

function getTagEmoji(tags?: string | null) {
  const tag = tags?.toLowerCase().split(",")[0]?.trim() ?? ""
  return genreEmoji[tag] || "📖"
}

function getGradient(idx: number) {
  const g = [
    "from-violet-900/5 via-purple-800/5",
    "from-rose-900/5 via-pink-800/5",
    "from-indigo-900/5 via-blue-800/5",
    "from-emerald-900/5 via-teal-800/5",
    "from-amber-900/5 via-orange-800/5",
    "from-cyan-900/5 via-sky-800/5",
  ]
  return g[idx % g.length]
}

function SectionHeader({ title, subtitle, link }: {
  title: string
  subtitle?: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="mb-6 flex items-end gap-3">
      <div>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="ml-auto shrink-0 rounded-lg border border-purple-200/60 px-3 py-1.5 text-xs font-medium text-purple-600 transition-all hover:bg-purple-600 hover:text-white dark:border-zinc-700/60 dark:text-purple-400 dark:hover:bg-purple-600 dark:hover:text-white"
        >
          {link.label} →
        </Link>
      )}
    </div>
  )
}

function StoryCard({ story }: { story: any }) {
  const tag = story.tags?.split(",")[0]?.trim() ?? ""
  return (
    <Link
      href={"/stories/" + story.id}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-purple-200/40 bg-white/60 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 dark:border-zinc-700/40 dark:bg-zinc-800/60"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900">
        {story.cover ? (
          <img src={story.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 transition-all duration-500 group-hover:scale-105 group-hover:opacity-70" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-4">
          {tag && (
            <span className="mb-1.5 w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {getTagEmoji(tag)} {tag}
            </span>
          )}
          <h3 className="text-base font-bold text-white drop-shadow-lg line-clamp-2">{story.title}</h3>
          {story.description && (
            <p className="mt-1 text-xs text-zinc-300 line-clamp-2">{story.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-[10px] font-bold text-white">
            {story.author.name?.[0] ?? "?"}
          </div>
          <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{story.author.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{story._count.chapters} ch</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{story._count.saves} ❤</span>
        </div>
      </div>
    </Link>
  )
}

function MediaPlaceholder({ icon, label, description }: { icon: string; label: string; description: string }) {
  return (
    <div className="flex w-56 shrink-0 snap-start flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-300/50 bg-white/40 p-6 text-center backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/30">
      <span className="text-3xl mb-3">{icon}</span>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</h3>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{description}</p>
    </div>
  )
}

function GenreSection({ tag, label, stories }: { tag: string; label: string; stories: any[] }) {
  if (!stories || stories.length === 0) return null
  return (
    <section className="py-6">
      <SectionHeader
        title={`${getTagEmoji(tag)} ${label}`}
        link={{ href: `/stories?genre=${tag}`, label: "View all" }}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stories.map((s) => <StoryCard key={s.id} story={s} />)}
      </div>
    </section>
  )
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const data = await getHomepageData()
  const { trending, editorsPicks, originals, latestChapters, personal, genreData } = data

  return (
    <div className="min-h-screen bg-[#D4C5F0] dark:bg-zinc-950 transition-colors duration-300">
      <AnimatedHero trending={trending} session={session} />

      <div className="relative z-30 -mt-16 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ── Continue Reading ── */}
          {session?.user && personal?.recentlyViewed && personal.recentlyViewed.length > 0 && (
            <section className="mb-8 rounded-2xl border border-purple-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/70">
              <SectionHeader title="📖 Continue Reading" subtitle="Pick up where you left off" />
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                {personal.recentlyViewed.map((s: any) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          {/* ── Trending Now ── */}
          {trending.length > 0 && (
            <section className="py-6">
              <SectionHeader title="🔥 Trending Now" subtitle="Most read this week" link={{ href: "/stories", label: "Discover more" }} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {trending.map((s: any) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          {/* ── Editor's Picks ── */}
          {editorsPicks.length > 0 && (
            <section className={`rounded-2xl bg-gradient-to-b ${getGradient(0)} p-6`}>
              <SectionHeader title="⭐ Editor's Picks" subtitle="Curated by the LikhaVerse team" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {editorsPicks.map((s: any) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          {/* ── Following ── */}
          {session?.user && personal?.followingStories && personal.followingStories.length > 0 && (
            <section className="py-6">
              <SectionHeader title="👥 Following" subtitle="New from authors you follow" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {personal.followingStories.map((s: any) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          {/* ── AI Recommendations ── */}
          {session?.user && personal?.recommended && personal.recommended.length > 0 && (
            <section className={`rounded-2xl bg-gradient-to-b ${getGradient(1)} p-6`}>
              <SectionHeader title="✨ Recommended For You" subtitle="Based on your reading history" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {personal.recommended.map((s: any) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          {/* ── Latest Chapters ── */}
          {latestChapters.length > 0 && (
            <section className="py-6">
              <SectionHeader title="🆕 Latest Chapters" subtitle="Recently updated stories" link={{ href: "/stories?sort=recent", label: "See all" }} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {latestChapters.map((s: any) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          {/* ── Originals ── */}
          {originals.length > 0 && (
            <section className={`rounded-2xl bg-gradient-to-b ${getGradient(2)} p-6`}>
              <SectionHeader title="🎬 Original Series" subtitle="LikhaVerse exclusives" link={{ href: "/stories?original=true", label: "Explore" }} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {originals.map((s: any) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          {/* ── Genre Sections ── */}
          <div className="mt-4 space-y-2">
            <GenreSection tag="romance" label="Romance" stories={genreData.romance} />
            <GenreSection tag="fantasy" label="Fantasy" stories={genreData.fantasy} />
            <GenreSection tag="drama" label="Drama" stories={genreData.drama} />
            <GenreSection tag="horror" label="Horror" stories={genreData.horror} />
            <GenreSection tag="comedy" label="Comedy" stories={genreData.comedy} />
          </div>

          {/* ── Movies ── */}
          <section className={`rounded-2xl bg-gradient-to-b ${getGradient(3)} p-6`}>
            <SectionHeader title="🎥 Movies" subtitle="Story adaptations coming soon" />
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory">
              <MediaPlaceholder icon="🎬" label="From Page to Screen" description="Stories adapted into films" />
              <MediaPlaceholder icon="🎞️" label="Fan Trailers" description="Community-made trailers" />
              <MediaPlaceholder icon="📽️" label="Behind the Scenes" description="Author interviews & more" />
            </div>
          </section>

          {/* ── Audiobooks ── */}
          <section className="py-6">
            <SectionHeader title="🎧 Audiobooks" subtitle="Listen to your favorite stories" />
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory">
              <MediaPlaceholder icon="🎙️" label="Narrated Editions" description="Professional narration" />
              <MediaPlaceholder icon="🎵" label="Audio Dramas" description="Full cast productions" />
              <MediaPlaceholder icon="🌙" label="Bedtime Stories" description="Relax & listen" />
            </div>
          </section>

          {/* ── CTA ── */}
          {!session?.user && (
            <section className="relative my-10 overflow-hidden rounded-2xl border border-purple-200/60 bg-white/70 px-8 py-16 text-center backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-400/20 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-amber-400/20 blur-[80px]" />
              <div className="relative">
                <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Ready to share your story?</h2>
                <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
                  Join LikhaVerse and start building your universe today. Write, publish, and connect with readers worldwide.
                </p>
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Link
                    href="/register"
                    className="rounded-xl bg-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500 hover:scale-105 active:scale-95"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/stories"
                    className="rounded-xl border border-purple-300/60 px-8 py-3.5 text-sm font-medium text-zinc-700 transition-all hover:border-purple-400 hover:text-purple-800 hover:bg-white/50 hover:scale-105 active:scale-95 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-purple-300"
                  >
                    Explore Stories
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
