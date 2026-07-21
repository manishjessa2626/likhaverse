import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function ProfileRedirectPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  redirect(`/profile/${session.user.id}`)
}
