import Link from "next/link"
import { Crown, Sparkles, Eye, Headphones } from "lucide-react"

export function PremiumTransition({
  storyId,
  nextChapterNumber,
  nextChapterTitle,
  remainingChapters,
}: {
  storyId: string
  nextChapterNumber: number
  nextChapterTitle: string
  remainingChapters: number
}) {
  return (
    <div className="my-20 text-center">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#D4C5F0] px-4 text-purple-400">
            ✦ ✦ ✦
          </span>
        </div>
      </div>

      <div className="mt-12 mx-auto max-w-md">
        <div className="rounded-2xl border border-purple-200/60 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <Crown size={24} className="text-amber-600" />
          </div>

          <h2 className="text-xl font-bold text-zinc-800">Experience Stories Like Never Before</h2>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            Upgrade your reading experience with cinematic mode, smooth animations, and unlimited access.
          </p>

          {/* Feature list */}
          <div className="mt-6 space-y-3 text-left">
            <div className="flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-2.5">
              <Sparkles size={18} className="text-purple-500 shrink-0" />
              <span className="text-sm text-zinc-700">Cinematic reading mode</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-2.5">
              <Eye size={18} className="text-purple-500 shrink-0" />
              <span className="text-sm text-zinc-700">Smooth transitions &amp; parallax</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-2.5">
              <Headphones size={18} className="text-purple-500 shrink-0" />
              <span className="text-sm text-zinc-700">Optional ambient sound</span>
            </div>
          </div>

          <p className="mt-5 text-sm text-zinc-500">
            Unlock the remaining <strong className="text-zinc-800">{remainingChapters}</strong> episodes.
          </p>
          <p className="mt-1 text-sm italic text-purple-600">
            &ldquo;{nextChapterTitle}&rdquo;
          </p>

          <Link
            href="/premium"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-3.5 text-sm font-bold text-white hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98]"
          >
            Go Premium
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <p className="mt-4 text-xs text-zinc-400">
            Unlimited access to all premium stories and chapters.
          </p>
        </div>
      </div>

      <Link
        href={"/stories/" + storyId}
        className="mt-6 inline-block text-sm text-zinc-500 hover:text-purple-700 transition-colors"
      >
        Back to story overview
      </Link>
    </div>
  )
}
