import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getClubs, getChallenges, getLiveSessions, getEvents, getMyClubs } from "@/app/actions/community"
import { CommunityHub } from "./CommunityHub"

export default async function CommunityPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login?callbackUrl=/community")

  const [clubs, challenges, sessions, events, myClubs] = await Promise.all([
    getClubs(),
    getChallenges(),
    getLiveSessions(),
    getEvents(),
    getMyClubs().catch(() => []),
  ])

  return (
    <CommunityHub
      clubs={JSON.parse(JSON.stringify(clubs))}
      challenges={JSON.parse(JSON.stringify(challenges))}
      sessions={JSON.parse(JSON.stringify(sessions))}
      events={JSON.parse(JSON.stringify(events))}
      myClubs={JSON.parse(JSON.stringify(myClubs))}
    />
  )
}
