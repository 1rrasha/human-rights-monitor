import { VictimHeader } from "@/components/victims/victim-header"
import { VictimFilters } from "@/components/victims/victim-filters"
import { VictimList } from "@/components/victims/victim-list"

export default function VictimsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <VictimHeader />
      <VictimFilters />
      <VictimList />
    </div>
  )
}
