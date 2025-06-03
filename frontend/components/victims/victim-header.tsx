"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function VictimHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Victim/Witness Database</h1>
        <p className="text-muted-foreground">Securely manage victim and witness information</p>
      </div>
      <Button className="gap-2">
        <PlusCircle className="h-4 w-4" />
        <span>Add Person</span>
      </Button>
    </div>
  )
}
