"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getReports, Report, ReportsQueryParams, updateReport } from "@/services/reports.service"
import { format } from "date-fns"
import { Eye, MapPin, Shield } from "lucide-react"
import { ReportDetails } from "./report-details"
import { ReportEdit } from "./report-edit"

interface ReportListProps {
  filters: ReportsQueryParams
}

export function ReportList({ filters }: ReportListProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const data = await getReports(filters)
        setReports(data)
        setError(null)
      } catch (err) {
        setError("Failed to fetch reports")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [filters])

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setIsViewDialogOpen(true)
  }

  const handleEditReport = (report: Report) => {
    setSelectedReport(report)
    setIsEditDialogOpen(true)
  }

  const handleSaveReport = async (reportId: string, data: any) => {
    try {
      const updatedReport = await updateReport(reportId, data)
      setReports(reports.map(report => 
        report._id === reportId ? updatedReport : report
      ))
    } catch (err) {
      console.error("Failed to update report:", err)
      throw err
    }
  }

  if (loading) {
    return <div>Loading reports...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (reports.length === 0) {
    return <div>No reports found</div>
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report._id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Report #{report.report_id}</CardTitle>
                <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
              </div>
              <CardDescription>
                {format(new Date(report.created_at), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>{report.incident_details.violation_types.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {report.incident_details.location.city}, {report.incident_details.location.country}
                </span>
              </div>
              <p className="text-sm line-clamp-3">{report.incident_details.description}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleViewReport(report)} className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedReport && (
        <>
          <ReportDetails
            report={selectedReport}
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
            onEdit={handleEditReport}
          />

          <ReportEdit
            report={selectedReport}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={handleSaveReport}
          />
        </>
      )}
    </>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "secondary"
    case "under_review":
      return "default"
    case "in_progress":
      return "outline"
    case "resolved":
      return "default"
    case "closed":
      return "destructive"
    default:
      return "default"
  }
} 