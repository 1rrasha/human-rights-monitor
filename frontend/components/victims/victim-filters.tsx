"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SlidersHorizontal, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { VictimsQueryParams } from "@/services/victims.service"
import { useCasesForVictimSelection } from "@/hooks/useVictims"

interface VictimFiltersProps {
  onFiltersChange: (filters: VictimsQueryParams) => void
  onCaseChange: (caseId: string) => void
}

export function VictimFilters({ onFiltersChange, onCaseChange }: VictimFiltersProps) {
  const [filters, setFilters] = useState<VictimsQueryParams>({ skip: 0, limit: 10 })
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const { cases } = useCasesForVictimSelection()

  const addFilter = (filter: string, key: keyof VictimsQueryParams, value: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter])
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      onFiltersChange(newFilters)
    }
  }

  const removeFilter = (filter: string, key: keyof VictimsQueryParams) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
    const newFilters = { ...filters, [key]: undefined }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            onValueChange={(value) => {
              onCaseChange(value)
              setActiveFilters([...activeFilters, `Case: ${value}`])
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Case" />
            </SelectTrigger>
            <SelectContent>
              {cases?.map((caseItem) => (
                <SelectItem key={caseItem._id} value={caseItem._id}>
                  {caseItem.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              value !== "all" && addFilter(`Status: ${value}`, "status", value)
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="monitored">Monitored</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>


        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {activeFilters.map((filter) => (
              <Button
                key={filter}
                variant="secondary"
                className="px-3 py-1 gap-1 bg-primary/10 hover:bg-primary/20 text-primary"
                onClick={() => {
                  const key = filter.startsWith("Status") ? "status" : "case_id"
                  removeFilter(filter, key)
                  if (filter.startsWith("Case")) onCaseChange("")
                }}
              >
                {filter}
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}