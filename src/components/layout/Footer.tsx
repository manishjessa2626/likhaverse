import Link from "next/link"

export default function Footer() {
  return (
    <footer className="mt-24 border-t bg-zinc-900 text-zinc-400">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="LikhaVerse" className="h-7 w-7 brightness-[10]" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                LikhaVerse
              </h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              Every Writer Has a Universe. A free platform for storytellers and readers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/stories" className="hover:text-white transition-colors">Browse Stories</Link></li>
              <li><Link href="/stories" className="hover:text-white transition-colors">Trending</Link></li>
              <li><Link href="/stories" className="hover:text-white transition-colors">New Releases</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Community</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">Start Writing</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Log In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Support</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><span className="cursor-default">Report an Issue</span></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} LikhaVerse by JMS. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
