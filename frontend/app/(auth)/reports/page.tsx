"use client"

import { useState } from "react"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportList } from "@/components/reports/report-list"
import { ReportHeader } from "@/components/reports/report-header"
import { ReportsQueryParams } from "@/services/analytics.service"

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportsQueryParams>({})

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ReportHeader />
      <ReportFilters onFiltersChange={setFilters} />
      <ReportList filters={filters} />
    </div>
  )
}