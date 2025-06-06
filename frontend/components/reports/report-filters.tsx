"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReportsQueryParams } from "@/services/reports.service"

interface ReportFiltersProps {
  onFiltersChange: (filters: ReportsQueryParams) => void
}

export function ReportFilters({ onFiltersChange }: ReportFiltersProps) {
  const [filters, setFilters] = useState<ReportsQueryParams>({
    status: null,
    location: null,
    violation_type: null,
    skip: 0,
    limit: 10,
  })

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value === "all" ? null : value })
  }

  const handleLocationChange = (value: string) => {
    setFilters({ ...filters, location: value || null })
  }

  const handleViolationTypeChange = (value: string) => {
    setFilters({ ...filters, violation_type: value === "all" ? null : value })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="Enter location"
          value={filters.location || ""}
          onChange={(e) => handleLocationChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="violation-type">Violation Type</Label>
        <Select
          value={filters.violation_type || "all"}
          onValueChange={handleViolationTypeChange}
        >
          <SelectTrigger id="violation-type">
            <SelectValue placeholder="Select violation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="arbitrary_detention">Arbitrary Detention</SelectItem>
            <SelectItem value="forced_displacement">Forced Displacement</SelectItem>
            <SelectItem value="torture">Torture</SelectItem>
            <SelectItem value="property_destruction">Property Destruction</SelectItem>
            <SelectItem value="freedom_restriction">Freedom Restriction</SelectItem>
            <SelectItem value="harassment">Harassment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 