"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ExternalLink, Eye, MoreHorizontal, Star } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

const recentCases = [
  {
    id: "HRM-2023-0425",
    title: "Forced Displacement in Northern Region",
    status: "under_investigation",
    priority: "high",
    location: "Northern Governorate, Syria",
    date: "Apr 20, 2023",
    starred: true,
  },
  {
    id: "HRM-2023-0426",
    title: "Arbitrary Detention of Journalists",
    status: "new",
    priority: "medium",
    location: "Capital City, Yemen",
    date: "Apr 22, 2023",
    starred: false,
  },
  {
    id: "HRM-2023-0427",
    title: "Torture in Detention Facility",
    status: "under_investigation",
    priority: "high",
    location: "Eastern Province, Syria",
    date: "Apr 25, 2023",
    starred: true,
  },
  {
    id: "HRM-2023-0428",
    title: "Attacks on Medical Facilities",
    status: "resolved",
    priority: "medium",
    location: "Southern Region, Yemen",
    date: "Apr 28, 2023",
    starred: false,
  },
  {
    id: "HRM-2023-0429",
    title: "Restriction of Freedom of Assembly",
    status: "new",
    priority: "low",
    location: "Western District, Syria",
    date: "May 1, 2023",
    starred: false,
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "new":
      return (
        <Badge variant="outline" className="status-badge status-badge-new">
          New
        </Badge>
      )
    case "under_investigation":
      return (
        <Badge variant="outline" className="status-badge status-badge-investigating">
          Investigating
        </Badge>
      )
    case "resolved":
      return (
        <Badge variant="outline" className="status-badge status-badge-resolved">
          Resolved
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge className="priority-badge-high">High</Badge>
    case "medium":
      return <Badge className="priority-badge-medium">Medium</Badge>
    case "low":
      return <Badge className="priority-badge-low">Low</Badge>
    default:
      return <Badge>{priority}</Badge>
  }
}

export function RecentCases() {
  const [starredCases, setStarredCases] = useState(
    recentCases.reduce(
      (acc, caseItem) => {
        acc[caseItem.id] = caseItem.starred
        return acc
      },
      {} as Record<string, boolean>,
    ),
  )

  const toggleStar = (id: string) => {
    setStarredCases((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <TooltipProvider>
      <Card className="data-card">
        <CardHeader className="data-card-header">
          <div>
            <CardTitle className="data-card-title">Recent Cases</CardTitle>
            <CardDescription>Latest human rights cases in the system</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1">
            <Link href="/cases">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCases.map((caseItem) => (
                  <TableRow key={caseItem.id} className="group">
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleStar(caseItem.id)}
                          >
                            <Star
                              className={`h-4 w-4 ${starredCases[caseItem.id] ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground group-hover:text-foreground"}`}
                            />
                            <span className="sr-only">Star case</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {starredCases[caseItem.id] ? "Remove from starred" : "Add to starred"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="font-medium font-mono">{caseItem.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{caseItem.title}</TableCell>
                    <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                    <TableCell>{getPriorityBadge(caseItem.priority)}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{caseItem.location}</TableCell>
                    <TableCell>{caseItem.date}</TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/cases/${caseItem.id}`} className="flex items-center cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>Open in New Tab</span>
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
    </TooltipProvider>
  )
}
