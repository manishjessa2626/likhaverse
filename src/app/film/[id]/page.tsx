import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getFilmProject } from "@/app/actions/films"
import { FilmProjectWorkspace } from "./FilmProjectWorkspace"

export default async function FilmProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login?callbackUrl=/film/" + id)

  try {
    const project = await getFilmProject(id)
    return <FilmProjectWorkspace project={JSON.parse(JSON.stringify(project))} />
  } catch {
    notFound()
  }
}
