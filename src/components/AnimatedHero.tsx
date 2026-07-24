"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowRight, PenSquare, Library, Sparkles } from "lucide-react"

interface AnimatedHeroProps {
  trending: any[]
  session: any
}

export function AnimatedHero({ trending, session }: AnimatedHeroProps) {
  const [particles, setParticles] = useState<{ left: string; top: string; animation: string; opacity: number }[]>([])
  const heroStory = trending[0]

  useEffect(() => {
    setParticles(
      Array.from({ length: 12 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
        opacity: 0.3 + Math.random() * 0.4,
      }))
    )
  }, [])

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-[#2a1f4e] to-indigo-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(217,119,6,0.08),transparent_50%)]" />
      </div>

      {/* Animated gradient mesh lines */}
      <div className="absolute inset-0 opacity-20">
        <svg className="h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mesh1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d="M0,200 Q360,0 720,200 T1440,200" fill="none" stroke="url(#mesh1)" strokeWidth="1" className="animate-float" />
          <path d="M0,400 Q360,600 720,400 T1440,400" fill="none" stroke="url(#mesh1)" strokeWidth="0.8" className="animate-float-delayed" />
          <path d="M0,600 Q360,400 720,600 T1440,600" fill="none" stroke="url(#mesh1)" strokeWidth="0.5" className="animate-float" style={{ animationDelay: "1s" }} />
        </svg>
      </div>

      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-purple-500/20 blur-[100px] animate-float" />
        <div className="absolute right-[15%] top-[30%] h-48 w-48 rounded-full bg-violet-400/15 blur-[80px] animate-float-delayed" />
        <div className="absolute left-[20%] bottom-[20%] h-40 w-40 rounded-full bg-amber-500/10 blur-[70px] animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute right-[25%] bottom-[30%] h-56 w-56 rounded-full bg-indigo-400/15 blur-[90px] animate-float-delayed" />
      </div>

      {/* Decorative particles (client-only to avoid hydration mismatch) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/30"
            style={{
              left: p.left,
              top: p.top,
              animation: p.animation,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Tagline */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-300/10 px-4 py-1.5 text-xs font-medium text-purple-300 backdrop-blur-sm">
          <Sparkles size={14} className="text-amber-400" />
          Where stories come to life
        </div>

        {/* Logo + Brand */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <img src="/logo.png" alt="" className="h-12 w-12" />
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              LikhaVerse
            </span>
          </h1>
        </div>

        {/* Welcome for logged-in users — Netflix-style hero with featured story */}
        {session?.user ? (
          <>
            {heroStory ? (
              <>
                <p className="text-base font-medium text-purple-300">
                  Welcome back, <span className="text-white">{session.user.name}</span>
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                  Trending Now
                </div>
                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white drop-shadow-lg">
                  {heroStory.title}
                </h2>
                <p className="mt-4 text-base text-purple-200/80 max-w-2xl mx-auto line-clamp-3">
                  {heroStory.description}
                </p>
                <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
                  <Link
                    href={"/stories/" + heroStory.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500 hover:scale-105 active:scale-95"
                  >
                    Read Now <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/write"
                    className="inline-flex items-center gap-2 rounded-xl border border-purple-400/40 bg-white/10 px-6 py-3.5 text-sm font-medium text-purple-200 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                  >
                    <PenSquare size={16} />
                    Write
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-xl font-medium text-purple-200 sm:text-2xl">
                  Welcome back, <span className="text-white">{session.user.name}</span>
                </p>
                <p className="mt-3 text-base text-purple-300/80 max-w-xl mx-auto">
                  Your universe is waiting. Pick up where you left off or create something new.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
                  <Link
                    href="/write"
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500 hover:scale-105 active:scale-95"
                  >
                    <PenSquare size={16} />
                    Continue Writing
                  </Link>
                  <Link
                    href="/library"
                    className="inline-flex items-center gap-2 rounded-xl border border-purple-400/40 bg-white/10 px-6 py-3 text-sm font-medium text-purple-200 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                  >
                    <Library size={16} />
                    My Library
                  </Link>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <p className="mt-4 text-lg text-purple-200 sm:text-xl max-w-2xl mx-auto leading-relaxed">
              A free storytelling platform where every writer builds a universe, every reader finds a world, and every story comes alive.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500 hover:scale-105 active:scale-95"
              >
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 rounded-xl border border-purple-400/40 bg-white/10 px-8 py-3.5 text-sm font-medium text-purple-200 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
              >
                Browse Stories
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#D4C5F0] dark:from-zinc-950 to-transparent" />
    </section>
  )
}
