import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RecentCases } from "@/components/dashboard/recent-cases"
import { ViolationMap } from "@/components/dashboard/violation-map"
import { ViolationStats } from "@/components/dashboard/violation-stats"

export default function Home() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <DashboardHeader />
      <DashboardCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViolationStats />
        <ViolationMap />
      </div>
      <RecentCases />
    </div>
  )
}