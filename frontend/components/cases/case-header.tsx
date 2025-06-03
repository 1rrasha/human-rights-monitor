"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, Filter, Download, Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"

export function CaseHeader() {
  return (
    <div className="page-header">
      <div className="page-header-pattern" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="animate-slide-down">
            <h1 className="text-3xl font-bold">Case Management</h1>
            <p className="text-white/80 mt-1">Track and manage human rights violation cases</p>
          </div>
          <Button className="gap-2 bg-white text-primary hover:bg-white/90 animate-slide-in-right">
            <PlusCircle className="h-4 w-4" />
            <span>New Case</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              placeholder="Search cases by ID, title, location..."
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" className="gap-2 bg-white/10 hover:bg-white/20 text-white">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button variant="ghost" className="gap-2 bg-white/10 hover:bg-white/20 text-white">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sort</span>
            </Button>
            <Button variant="ghost" className="gap-2 bg-white/10 hover:bg-white/20 text-white">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
