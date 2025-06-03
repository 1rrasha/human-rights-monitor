"use client"

import { Button } from "@/components/ui/button"
import { Download, Share } from "lucide-react"

export function AnalyticsHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Analysis</h1>
        <p className="text-muted-foreground">Visualize and analyze human rights violation data</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2">
          <Share className="h-4 w-4" />
          <span>Share</span>
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  )
}
