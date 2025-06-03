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
import { AlertTriangle, Edit, Eye, FolderOpen, Lock, MoreHorizontal, Shield, Trash, User } from "lucide-react"

const victims = [
  {
    id: "V-2023-0001",
    type: "victim",
    anonymous: false,
    gender: "female",
    age: 34,
    ethnicity: "Kurdish",
    occupation: "Teacher",
    risk: "medium",
    cases: 1,
    protection: true,
  },
  {
    id: "V-2023-0002",
    type: "victim",
    anonymous: true,
    gender: "male",
    age: 45,
    ethnicity: "Arab",
    occupation: "Journalist",
    risk: "high",
    cases: 2,
    protection: true,
  },
  {
    id: "V-2023-0003",
    type: "witness",
    anonymous: false,
    gender: "male",
    age: 28,
    ethnicity: "Yemeni",
    occupation: "Doctor",
    risk: "low",
    cases: 1,
    protection: false,
  },
  {
    id: "V-2023-0004",
    type: "victim",
    anonymous: false,
    gender: "female",
    age: 19,
    ethnicity: "Syrian",
    occupation: "Student",
    risk: "medium",
    cases: 1,
    protection: true,
  },
  {
    id: "V-2023-0005",
    type: "witness",
    anonymous: true,
    gender: "male",
    age: 52,
    ethnicity: "Kurdish",
    occupation: "Farmer",
    risk: "high",
    cases: 3,
    protection: true,
  },
  {
    id: "V-2023-0006",
    type: "victim",
    anonymous: false,
    gender: "female",
    age: 41,
    ethnicity: "Yemeni",
    occupation: "Nurse",
    risk: "low",
    cases: 1,
    protection: false,
  },
  {
    id: "V-2023-0007",
    type: "victim",
    anonymous: false,
    gender: "male",
    age: 16,
    ethnicity: "Syrian",
    occupation: "Student",
    risk: "high",
    cases: 2,
    protection: true,
  },
  {
    id: "V-2023-0008",
    type: "witness",
    anonymous: false,
    gender: "female",
    age: 37,
    ethnicity: "Arab",
    occupation: "Lawyer",
    risk: "medium",
    cases: 4,
    protection: true,
  },
]

const getTypeBadge = (type: string) => {
  switch (type) {
    case "victim":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
        >
          Victim
        </Badge>
      )
    case "witness":
      return (
        <Badge
          variant="outline"
          className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800"
        >
          Witness
        </Badge>
      )
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case "high":
      return <Badge className="bg-red-500">High</Badge>
    case "medium":
      return <Badge className="bg-orange-500">Medium</Badge>
    case "low":
      return <Badge className="bg-green-500">Low</Badge>
    default:
      return <Badge>{risk}</Badge>
  }
}

export function VictimList() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Demographics</TableHead>
              <TableHead>Occupation</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead className="text-center">Cases</TableHead>
              <TableHead>Protection</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {victims.map((victim) => (
              <TableRow key={victim.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium flex items-center gap-2">
                  {victim.anonymous && <Lock className="h-3 w-3 text-muted-foreground" />}
                  {victim.id}
                </TableCell>
                <TableCell>{getTypeBadge(victim.type)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {victim.gender}, {victim.age}
                    </span>
                    <span className="text-xs text-muted-foreground">{victim.ethnicity}</span>
                  </div>
                </TableCell>
                <TableCell>{victim.occupation}</TableCell>
                <TableCell>{getRiskBadge(victim.risk)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="flex items-center justify-center gap-1 w-8 mx-auto">
                    <FolderOpen className="h-3 w-3" />
                    {victim.cases}
                  </Badge>
                </TableCell>
                <TableCell>
                  {victim.protection ? (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      <span>Active</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      None
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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
                        <span>Edit Record</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        <span>Assign to Case</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <span>Update Risk Level</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="h-4 w-4 mr-2" />
                        <span>Delete Record</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
