import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditProfileForm } from "./EditProfileForm"

export default async function EditSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, bio: true, avatar: true, role: true },
  })

  if (!user) redirect("/login")

  return <EditProfileForm initial={user} />
}
