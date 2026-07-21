<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# LikhaVerse Platform Architecture

## Four Connected Worlds
```
                  LIKHAVERSE
                ┌─────────────┐
                │   Reader    │
                └──────┬──────┘
         ┌─────────────┼──────────────┐
         │                            │
   ┌─────┴──────┐             ┌───────┴──────┐
   │   Author   │             │  Filmmaker   │
   └─────┬──────┘             └───────┬──────┘
         │                            │
         └─────────────┬──────────────┘
                       │
                ┌──────┴──────┐
                │ AI Creative │
                │   Engine    │
                └─────────────┘
```

## Route Map (81 total routes)
See `docs/ROUTES.md` for the complete sitemap.
See `docs/ARCHITECTURE.md` for full IA, user flows, and content types.

## Brand Identity
- Logo: `/logo.png` + gradient wordmark (violet→purple→indigo)
- Tagline: "Where stories come to life"
- Primary palette: `lv-*` purple scale (lilac), `sunset-*` amber (PH sunset)
- Glass design: `.glass-card` with backdrop-blur, purple-200/60 borders
- Dark mode: zinc-800/70 cards, zinc-700/60 borders
- Typography: Geist Sans (UI), serif (reading)
- Tags: `lv-`, `sunset-`, `glass-card`, `animate-*`

## Key Conventions
- Purple layout bg: `bg-[#D4C5F0]` (body), `bg-white/70` (cards)
- Glass cards: `bg-white/70 backdrop-blur-sm border-purple-200/60` (light), `bg-zinc-800/70 border-zinc-700/60 shadow-black/10 backdrop-blur-sm` (dark)
- Buttons: `bg-purple-600 hover:bg-purple-500 text-white`
- Dark mode: `.dark` class on wrapper, `dark:` Tailwind variants via `@custom-variant dark (&:where(.dark, .dark *))`
- Studio pages are author-facing; admin routes are super-admin only
- No ads anywhere
- 🇵🇭 PH localization: ₱ pricing, GCash, Taglish UI for premium/coins
