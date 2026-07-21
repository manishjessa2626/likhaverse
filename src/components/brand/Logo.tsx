"use client"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showTagline?: boolean
  variant?: "full" | "icon" | "wordmark"
}

const sizes = { sm: "h-6 w-6", md: "h-7 w-7", lg: "h-9 w-9" }
const textSizes = { sm: "text-base", md: "text-lg", lg: "text-xl" }
const tagSizes = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" }

export function Logo({ size = "md", showTagline = false, variant = "full" }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      {variant !== "wordmark" && (
        <img src="/logo.png" alt="LikhaVerse" className={`${sizes[size]} shrink-0`} />
      )}

      {variant !== "icon" && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent`}>
            LikhaVerse
          </span>
          {showTagline && (
            <span className={`${tagSizes[size]} text-zinc-400 dark:text-zinc-500 -mt-0.5`}>
              Where stories come to life
            </span>
          )}
        </div>
      )}
    </div>
  )
}
