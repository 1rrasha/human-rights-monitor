"use client"

import { Button } from "@/components/ui/button"
import { Bell, Calendar, Download, Filter, Search, User, Settings, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export function DashboardHeader() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="page-header">
      <div className="page-header-pattern" />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="animate-slide-down">
            <h1 className="text-3xl font-bold">Human Rights Monitor</h1>
            <p className="text-white/80 mt-1">Overview of monitoring activities and insights</p>
          </div>

          <div className="flex items-center gap-2 animate-slide-in-right">
            <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white">
              <HelpCircle className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white">
              <Settings className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative bg-white/10 hover:bg-white/20 text-white">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-white">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 font-medium border-b">Notifications</div>
                <DropdownMenuItem className="flex flex-col items-start cursor-pointer p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-2 w-full">
                    <Badge variant="outline" className="status-badge-new">
                      New
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="font-medium mt-1">New case assigned</div>
                  <div className="text-sm text-muted-foreground">Case HRM-2023-0425 has been assigned to you</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start cursor-pointer p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-2 w-full">
                    <Badge variant="outline" className="status-badge-investigating">
                      Urgent
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">5 hours ago</span>
                  </div>
                  <div className="font-medium mt-1">Report submitted</div>
                  <div className="text-sm text-muted-foreground">New incident report IR-2023-0789 requires review</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start cursor-pointer p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-2 w-full">
                    <Badge variant="outline" className="priority-badge-high">
                      High Priority
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">Yesterday</span>
                  </div>
                  <div className="font-medium mt-1">Risk level updated</div>
                  <div className="text-sm text-muted-foreground">Victim risk assessment changed to high</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 bg-white/10 hover:bg-white/20 text-white">
                  <Calendar className="h-4 w-4" />
                  <span>Last 30 days</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                <DropdownMenuItem>Last 90 days</DropdownMenuItem>
                <DropdownMenuItem>This year</DropdownMenuItem>
                <DropdownMenuItem>All time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 border-2 border-white/30 cursor-pointer hover:border-white/60 transition-colors">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center gap-2 p-2 border-b">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-xs text-muted-foreground">john.doe@hrm.org</div>
                  </div>
                </div>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              placeholder="Search cases, reports, or victims..."
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
            />
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-white/10 p-1">
              <TabsTrigger
                value="all"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="cases"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                Cases
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                Reports
              </TabsTrigger>
              <TabsTrigger
                value="victims"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                Victims
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Button variant="ghost" className="gap-2 bg-white/10 hover:bg-white/20 text-white">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
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
