import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getFilmProjects } from "@/app/actions/films"
import { FilmProjectLibrary } from "./FilmProjectLibrary"

export default async function FilmPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login?callbackUrl=/film")

  const projects = await getFilmProjects()

  return <FilmProjectLibrary projects={projects} />
}
