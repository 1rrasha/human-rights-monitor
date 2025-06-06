"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SlidersHorizontal, X, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CasesQueryParams } from "@/services/cases.service"

interface CaseFiltersProps {
  onFiltersChange: (filters: CasesQueryParams) => void
}

export function CaseFilters({ onFiltersChange }: CaseFiltersProps) {
  const [filters, setFilters] = useState<CasesQueryParams>({ skip: 0, limit: 10 })
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const addFilter = (filter: string, key: keyof CasesQueryParams, value: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter])
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      onFiltersChange(newFilters)
    }
  }

  const removeFilter = (filter: string, key: keyof CasesQueryParams) => {
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
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="under_investigation">Under Investigation</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.location || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                removeFilter("Country: " + filters.location, "location")
              } else {
                addFilter(`Country: ${value}`, "location", value)
              }
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="syria">Syria</SelectItem>
              <SelectItem value="yemen">Yemen</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.violation_type || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                removeFilter("Violation: " + filters.violation_type, "violation_type")
              } else {
                addFilter(`Violation: ${value}`, "violation_type", value)
              }
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Violation Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="forced_displacement">Forced Displacement</SelectItem>
              <SelectItem value="property_destruction">Property Destruction</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span>Date Range</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Select Date Range</h4>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="from">From</Label>
                      <Input
                        id="from"
                        type="date"
                        onChange={(e) => {
                          setFilters({ ...filters, from: e.target.value })
                          onFiltersChange({ ...filters, from: e.target.value })
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="to">To</Label>
                      <Input
                        id="to"
                        type="date"
                        onChange={(e) => {
                          setFilters({ ...filters, to: e.target.value })
                          onFiltersChange({ ...filters, to: e.target.value })
                        }}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (filters.from || filters.to) {
                      addFilter("Date: Custom Range", "date_range", "custom")
                    }
                  }}
                >
                  Apply Date Range
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span>More Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Violation Types</h4>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Forced Displacement",
                      "Property Destruction",
                    ].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.toLowerCase().replace(" ", "_")}
                          onCheckedChange={(checked) => {
                            const value = type.toLowerCase().replace(" ", "_")
                            if (checked) {
                              addFilter(`Type: ${type}`, "violation_type", value)
                            } else {
                              removeFilter(`Type: ${type}`, "violation_type")
                            }
                          }}
                        />
                        <Label htmlFor={type.toLowerCase().replace(" ", "_")}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => {
                      setActiveFilters([])
                      setFilters({ skip: 0, limit: 10 })
                      onFiltersChange({ skip: 0, limit: 10 })
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onFiltersChange(filters)
                    }}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="px-3 py-1 gap-1 bg-primary/10 hover:bg-primary/20 text-primary"
              >
                {filter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => {
                    const key = filter.startsWith("Status")
                      ? "status"
                      : filter.startsWith("Country")
                      ? "location"
                      : filter.startsWith("Violation") || filter.startsWith("Type")
                      ? "violation_type"
                      : "date_range"
                    removeFilter(filter, key)
                  }}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            ))}
            {activeFilters.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setActiveFilters([])
                  setFilters({ skip: 0, limit: 10 })
                  onFiltersChange({ skip: 0, limit: 10 })
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}