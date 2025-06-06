"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, Filter, Download, Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function ReportHeader() {
  const router = useRouter()

  return (
    <div className="page-header">
      <div className="page-header-pattern" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="animate-slide-down">
            <h1 className="text-3xl font-bold">Report Management</h1>
            <p className="text-white/80 mt-1">Track and manage human rights violation reports</p>
          </div>
          <Button 
            onClick={() => router.push('/reports/add')}
            className="gap-2 z-50 bg-white text-primary hover:bg-white/90 animate-slide-in-right"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Report</span>
          </Button>
        </div>

      </div>
    </div>
  )
}