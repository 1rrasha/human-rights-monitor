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

export function CaseFilters() {
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Select defaultValue="all" onValueChange={(value) => value !== "all" && addFilter(`Status: ${value}`)}>
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

          <Select defaultValue="all" onValueChange={(value) => value !== "all" && addFilter(`Priority: ${value}`)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all" onValueChange={(value) => value !== "all" && addFilter(`Country: ${value}`)}>
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
                      <Input id="from" type="date" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="to">To</Label>
                      <Input id="to" type="date" />
                    </div>
                  </div>
                </div>
                <Button onClick={() => addFilter("Date: Custom Range")}>Apply Date Range</Button>
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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type1"
                        onCheckedChange={(checked) => {
                          if (checked) addFilter("Type: Arbitrary Detention")
                          else removeFilter("Type: Arbitrary Detention")
                        }}
                      />
                      <Label htmlFor="type1">Arbitrary Detention</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type2"
                        onCheckedChange={(checked) => {
                          if (checked) addFilter("Type: Forced Displacement")
                          else removeFilter("Type: Forced Displacement")
                        }}
                      />
                      <Label htmlFor="type2">Forced Displacement</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type3"
                        onCheckedChange={(checked) => {
                          if (checked) addFilter("Type: Torture")
                          else removeFilter("Type: Torture")
                        }}
                      />
                      <Label htmlFor="type3">Torture</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type4"
                        onCheckedChange={(checked) => {
                          if (checked) addFilter("Type: Property Destruction")
                          else removeFilter("Type: Property Destruction")
                        }}
                      />
                      <Label htmlFor="type4">Property Destruction</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type5"
                        onCheckedChange={(checked) => {
                          if (checked) addFilter("Type: Freedom Restriction")
                          else removeFilter("Type: Freedom Restriction")
                        }}
                      />
                      <Label htmlFor="type5">Freedom Restriction</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type6"
                        onCheckedChange={(checked) => {
                          if (checked) addFilter("Type: Other")
                          else removeFilter("Type: Other")
                        }}
                      />
                      <Label htmlFor="type6">Other</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Assigned To</h4>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assigned1"
                        onCheckedChange={(checked) => {
                          if (checked) addFilter("Assigned: Me")
                          else removeFilter("Assigned: Me")
                        }}
                      />
                      <Label htmlFor="assigned1">Me</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assigned2"
                        onCheckedChange={(checked) => {
                          if (checked) addFilter("Assigned: Unassigned")
                          else removeFilter("Assigned: Unassigned")
                        }}
                      />
                      <Label htmlFor="assigned2">Unassigned</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assigned3"
                        onCheckedChange={(checked) => {
                          if (checked) addFilter("Assigned: Team A")
                          else removeFilter("Assigned: Team A")
                        }}
                      />
                      <Label htmlFor="assigned3">Team A</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assigned4"
                        onCheckedChange={(checked) => {
                          if (checked) addFilter("Assigned: Team B")
                          else removeFilter("Assigned: Team B")
                        }}
                      />
                      <Label htmlFor="assigned4">Team B</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => setActiveFilters([])}>
                    Reset
                  </Button>
                  <Button size="sm">Apply Filters</Button>
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
                  onClick={() => removeFilter(filter)}
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
                onClick={() => setActiveFilters([])}
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
