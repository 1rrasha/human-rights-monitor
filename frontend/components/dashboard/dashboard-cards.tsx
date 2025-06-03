"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, FileText, FolderOpen, TrendingUp, TrendingDown, Users, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

export function DashboardCards() {
  const [progress, setProgress] = useState(13)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="stat-card group card-hover overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="stat-card-icon">
          <FolderOpen className="h-5 w-5" />
        </div>
        <CardHeader className="p-0">
          <CardTitle className="stat-card-label">Active Cases</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="stat-card-value">127</div>
          <div className="stat-card-trend stat-card-trend-up">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>12%</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="stat-card group card-hover overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="stat-card-icon">
          <FileText className="h-5 w-5" />
        </div>
        <CardHeader className="p-0">
          <CardTitle className="stat-card-label">New Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="stat-card-value">43</div>
          <div className="stat-card-trend stat-card-trend-up">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>8%</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last report 2 hours ago</span>
          </div>
        </CardContent>
      </Card>

      <Card className="stat-card group card-hover overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="stat-card-icon">
          <Users className="h-5 w-5" />
        </div>
        <CardHeader className="p-0">
          <CardTitle className="stat-card-label">Registered Victims</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="stat-card-value">289</div>
          <div className="stat-card-trend stat-card-trend-up">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>15%</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Male</span>
              <span className="font-medium">142</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Female</span>
              <span className="font-medium">118</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Children</span>
              <span className="font-medium">29</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="stat-card group card-hover overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="stat-card-icon">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <CardHeader className="p-0">
          <CardTitle className="stat-card-label">High Risk Cases</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="stat-card-value">32</div>
          <div className="stat-card-trend stat-card-trend-down">
            <TrendingDown className="h-3 w-3 mr-1" />
            <span>5%</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="pulse-dot">
              <span className="sr-only">Active alert</span>
            </div>
            <span className="text-xs text-muted-foreground">3 require immediate attention</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
