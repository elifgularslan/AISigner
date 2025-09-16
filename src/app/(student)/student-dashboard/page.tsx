import { getMockProfileSummary } from "@/features/student/server/profileSummary"
import { ProfileSummaryCard } from "@/features/student/ui/ProfileSummaryCard"
//import { db } from "@/lib/db"
import { prisma } from "@/lib/db"


import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/nextauth"

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) return <p>Onboarding verisi bulunamadı.</p>

  const summaryData = await getMockProfileSummary({
    experienceLevel: profile.experienceLevel,
    interests: profile.interests,
    goals: profile.goals ?? "Henüz hedef belirtilmemiş",
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mt-4">Hoş geldin, {session.user.name}</h1>
      <ProfileSummaryCard
        level={summaryData.level}
        tracks={summaryData.tracks}
        summary={summaryData.summary}
      />
    </div>
  )
}