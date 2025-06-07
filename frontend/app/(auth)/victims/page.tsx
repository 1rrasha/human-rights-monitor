"use client"

import { useState } from "react"
import { VictimFilters } from "@/components/victims/victim-filters"
import { VictimList } from "@/components/victims/victim-list"
import { VictimHeader } from "@/components/victims/victim-header"
import { VictimsQueryParams } from "@/services/victims.service"

export default function VictimsPage() {
  const [caseId, setCaseId] = useState<string>("")
  const [filters, setFilters] = useState<VictimsQueryParams>({ skip: 0, limit: 10 })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <VictimHeader />
      <VictimFilters onFiltersChange={setFilters} onCaseChange={setCaseId} />
      <VictimList caseId={caseId} filters={filters} />
    </div>
  )
}