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
import {
  AlertTriangle,
  Calendar,
  Edit,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Trash,
  Users,
  Star,
  Clock,
  UserPlus,
  Share,
  MessageSquare,
} from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const cases = [
  {
    id: "HRM-2023-0425",
    title: "Forced Displacement in Northern Region",
    status: "under_investigation",
    priority: "high",
    location: "Northern Governorate, Syria",
    date: "Apr 20, 2023",
    victims: 15,
    reports: 3,
    assignedTo: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
    lastUpdated: "2 hours ago",
  },
  {
    id: "HRM-2023-0426",
    title: "Arbitrary Detention of Journalists",
    status: "new",
    priority: "medium",
    location: "Capital City, Yemen",
    date: "Apr 22, 2023",
    victims: 4,
    reports: 2,
    assignedTo: null,
    lastUpdated: "1 day ago",
  },
  {
    id: "HRM-2023-0427",
    title: "Torture in Detention Facility",
    status: "under_investigation",
    priority: "high",
    location: "Eastern Province, Syria",
    date: "Apr 25, 2023",
    victims: 8,
    reports: 5,
    assignedTo: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SJ",
    },
    lastUpdated: "5 hours ago",
  },
  {
    id: "HRM-2023-0428",
    title: "Attacks on Medical Facilities",
    status: "resolved",
    priority: "medium",
    location: "Southern Region, Yemen",
    date: "Apr 28, 2023",
    victims: 12,
    reports: 4,
    assignedTo: {
      name: "Ahmed Hassan",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AH",
    },
    lastUpdated: "3 days ago",
  },
  {
    id: "HRM-2023-0429",
    title: "Restriction of Freedom of Assembly",
    status: "new",
    priority: "low",
    location: "Western District, Syria",
    date: "May 1, 2023",
    victims: 20,
    reports: 2,
    assignedTo: null,
    lastUpdated: "12 hours ago",
  },
  {
    id: "HRM-2023-0430",
    title: "Forced Conscription of Minors",
    status: "under_investigation",
    priority: "high",
    location: "Northern Region, Yemen",
    date: "May 3, 2023",
    victims: 7,
    reports: 3,
    assignedTo: {
      name: "Maria Rodriguez",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MR",
    },
    lastUpdated: "1 hour ago",
  },
  {
    id: "HRM-2023-0431",
    title: "Destruction of Cultural Heritage",
    status: "new",
    priority: "medium",
    location: "Central District, Syria",
    date: "May 5, 2023",
    victims: 0,
    reports: 1,
    assignedTo: null,
    lastUpdated: "2 days ago",
  },
  {
    id: "HRM-2023-0432",
    title: "Denial of Humanitarian Access",
    status: "under_investigation",
    priority: "high",
    location: "Eastern Region, Yemen",
    date: "May 8, 2023",
    victims: 35,
    reports: 6,
    assignedTo: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
    lastUpdated: "3 hours ago",
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

export function CaseList() {
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [starredCases, setStarredCases] = useState<string[]>([])

  const toggleSelectAll = () => {
    if (selectedCases.length === cases.length) {
      setSelectedCases([])
    } else {
      setSelectedCases(cases.map((c) => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedCases.includes(id)) {
      setSelectedCases(selectedCases.filter((caseId) => caseId !== id))
    } else {
      setSelectedCases([...selectedCases, id])
    }
  }

  const toggleStar = (id: string) => {
    if (starredCases.includes(id)) {
      setStarredCases(starredCases.filter((caseId) => caseId !== id))
    } else {
      setStarredCases([...starredCases, id])
    }
  }

  return (
    <TooltipProvider>
      <Card className="data-card">
        <CardContent className="p-0">
          {selectedCases.length > 0 && (
            <div className="p-2 bg-muted/50 border-b flex items-center justify-between animate-slide-down">
              <div className="text-sm">
                <span className="font-medium">{selectedCases.length}</span> cases selected
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-8">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Assign
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-destructive hover:text-destructive">
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
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
                      checked={selectedCases.length === cases.length && cases.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Case ID</TableHead>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Victims</TableHead>
                  <TableHead className="text-center">Reports</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem) => (
                  <TableRow key={caseItem.id} className="group">
                    <TableCell>
                      <Checkbox
                        checked={selectedCases.includes(caseItem.id)}
                        onCheckedChange={() => toggleSelect(caseItem.id)}
                      />
                    </TableCell>
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
                              className={`h-4 w-4 ${starredCases.includes(caseItem.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground group-hover:text-foreground"}`}
                            />
                            <span className="sr-only">Star case</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {starredCases.includes(caseItem.id) ? "Remove from starred" : "Add to starred"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="font-medium font-mono">{caseItem.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">{caseItem.title}</TableCell>
                    <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                    <TableCell>{getPriorityBadge(caseItem.priority)}</TableCell>
                    <TableCell className="flex items-center gap-1 max-w-[150px] truncate">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {caseItem.location}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {caseItem.date}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="flex items-center justify-center gap-1 w-10 mx-auto">
                        <Users className="h-3 w-3" />
                        {caseItem.victims}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="flex items-center justify-center gap-1 w-8 mx-auto">
                        <FileText className="h-3 w-3" />
                        {caseItem.reports}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {caseItem.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={caseItem.assignedTo.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{caseItem.assignedTo.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-[100px]">{caseItem.assignedTo.name}</span>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {caseItem.lastUpdated}
                      </div>
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            <span>Edit Case</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span>Add Comment</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <span>Mark as High Priority</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            <span>Delete Case</span>
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
