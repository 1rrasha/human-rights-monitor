"use client"

import { useState } from "react"
import { CaseFilters } from "@/components/cases/case-filters"
import { CaseList } from "@/components/cases/case-list"
import { CaseHeader } from "@/components/cases/case-header"
import { CasesQueryParams } from "@/services/cases.service"

export default function CasesPage() {
  const [filters, setFilters] = useState<CasesQueryParams>({})

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CaseHeader />
      <CaseFilters onFiltersChange={setFilters} />
      <CaseList filters={filters} />
    </div>
  )
}