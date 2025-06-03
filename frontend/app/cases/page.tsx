import { CaseFilters } from "@/components/cases/case-filters"
import { CaseList } from "@/components/cases/case-list"
import { CaseHeader } from "@/components/cases/case-header"

export default function CasesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <CaseHeader />
      <CaseFilters />
      <CaseList />
    </div>
  )
}
