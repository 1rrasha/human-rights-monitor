"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Eye, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useVictims } from "@/hooks/useVictims"
import { Victim, VictimsQueryParams, UpdateVictimData } from "@/services/victims.service"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { VictimDetails } from "./victim-details"
import { VictimEdit } from "./victim-edit"

interface VictimListProps {
  caseId: string
  filters: VictimsQueryParams
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="outline" className="status-badge status-badge-active">Active</Badge>
    case "pending":
      return <Badge variant="outline" className="status-badge status-badge-monitored">Pending</Badge>
    case "completed":
      return <Badge variant="outline" className="status-badge status-badge-resolved">Completed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getRiskLevelBadge = (riskLevel: string) => {
  switch (riskLevel) {
    case "high":
      return <Badge className="risk-badge-high bg-red-500">High</Badge>
    case "medium":
      return <Badge className="risk-badge-medium bg-yellow-500">Medium</Badge>
    case "low":
      return <Badge className="risk-badge-low bg-green-500">Low</Badge>
    default:
      return <Badge>{riskLevel}</Badge>
  }
}

export function VictimList({ caseId, filters }: VictimListProps) {
  const { victims, isLoading, error, updateVictim } = useVictims(caseId, filters)
  const { toast } = useToast()
  const [selectedVictims, setSelectedVictims] = useState<string[]>([])
  const [selectedVictim, setSelectedVictim] = useState<Victim | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const router = useRouter()

  const toggleSelectAll = () => {
    if (selectedVictims.length === victims?.length) {
      setSelectedVictims([])
    } else {
      setSelectedVictims(victims?.map((v) => v._id) || [])
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedVictims.includes(id)) {
      setSelectedVictims(selectedVictims.filter((victimId) => victimId !== id))
    } else {
      setSelectedVictims([...selectedVictims, id])
    }
  }

  const handleViewVictim = (victim: Victim) => {
    setSelectedVictim(victim)
    setIsDetailsOpen(true)
  }

  const handleEditVictim = async (victim: Victim) => {
    try {
      await updateVictim({
        victimId: victim._id,
        data: {
          risk_assessment: victim.risk_assessment,
          support_services: victim.support_services,
          demographics: victim.demographics,
          contact_info: victim.contact_info,
        },
      })
      toast({ title: "Success", description: "Victim updated successfully" })
      setIsEditOpen(false)
    } catch (error) {
      console.error("Failed to update victim:", error)
      toast({
        title: "Error",
        description: "Failed to update victim",
        variant: "destructive",
      })
    }
  }

  if (!caseId) {
    return (
      <Card className="data-card">
        <CardContent className="p-6 text-center">
          <p>Please select a case to view victims.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="data-card">
        <CardContent className="p-6 text-center">
          <p>Loading victims...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="data-card">
        <CardContent className="p-6 text-center text-destructive">
          {error.message.includes('401') ? (
            <div className="space-y-2">
              <p className="font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground">This section requires administrator privileges.</p>
            </div>
          ) : error.message.includes('403') ? (
            <div className="space-y-2">
              <p className="font-medium">Permission Denied</p>
              <p className="text-sm text-muted-foreground">You don't have permission to access this section.</p>
            </div>
          ) : (
            <p>Error loading victims: {error.message}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!victims || victims.length === 0) {
    return (
      <Card className="data-card">
        <CardContent className="p-6 text-center">
          <p>No victims found for this case.</p>
        </CardContent>
      </Card>
    )
  }

  console.log(victims)

  return (
    <TooltipProvider>
      <Card className="data-card">
        <CardContent className="p-0">
          {selectedVictims.length > 0 && (
            <div className="p-2 bg-muted/50 border-b flex items-center justify-between animate-slide-down">
              <div className="text-sm">
                <span className="font-medium">{selectedVictims.length}</span> victims selected
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-8">
                  Bulk Update
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedVictims.length === victims.length && victims.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Support Status</TableHead>
                  <TableHead>Risk Level</TableHead>

                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {victims.map((victim) => (
                  <TableRow key={victim._id} className="group">
                    <TableCell>
                      <Checkbox
                        checked={selectedVictims.includes(victim._id)}
                        onCheckedChange={() => toggleSelect(victim._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {victim.anonymous ? (
                        "Anonymous"
                      ) : (
                        `${victim.demographics.gender}, ${victim.demographics.age}, ${victim.demographics.ethnicity}`
                      )}
                    </TableCell>
                    <TableCell>
                      {victim.support_services.length > 0
                        ? getStatusBadge(victim.support_services[0].status)
                        : <Badge variant="outline">No Support</Badge>}
                    </TableCell>
                    <TableCell>
                      {getRiskLevelBadge(victim.risk_assessment.level)}
                    </TableCell>

                    <TableCell>
                      {new Date(victim.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewVictim(victim)}>
                            <Eye className="h-4 w-4 mr-2" />
                            <span>View Details</span>
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedVictim && (
        <>
          <VictimDetails
            victim={selectedVictim}
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            onEdit={(victim) => {
              setSelectedVictim(victim)
              setIsDetailsOpen(false)
              setIsEditOpen(true)
            }}
          />
          <VictimEdit
            victim={selectedVictim}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSave={handleEditVictim}
          />
        </>
      )}
    </TooltipProvider>
  )
}