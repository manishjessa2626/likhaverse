import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
      <div className="max-w-md text-center space-y-6">
        <div className="text-7xl font-bold text-amber-700/20 dark:text-zinc-100/10">
          404
        </div>
        <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">
          Page not found
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button>Go home</Button>
        </Link>
      </div>
    </div>
  )
}
