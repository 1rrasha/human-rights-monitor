"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Report, UpdateReportData } from "@/services/reports.service"

interface ReportEditProps {
  report: Report
  isOpen: boolean
  onClose: () => void
  onSave: (reportId: string, data: UpdateReportData) => Promise<void>
}

export function ReportEdit({ report, isOpen, onClose, onSave }: ReportEditProps) {
  const { toast } = useToast()
  const [editedReport, setEditedReport] = useState<UpdateReportData>({
    report: JSON.stringify({
      status: report.status,
      incident_details: {
        date: report.incident_details.date,
        location: {
          country: report.incident_details.location.country,
          city: report.incident_details.location.city,
        },
        description: report.incident_details.description,
        violation_types: report.incident_details.violation_types,
      },
    }),
  })

  const handleSave = async () => {
    try {
      await onSave(report.report_id, editedReport)
      toast({
        title: "Success",
        description: "Report updated successfully",
        duration: 3000,
      })
      onClose()
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          duration: 5000,
        })
        window.location.href = '/login'
      } else if (error.response?.status === 403) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This action requires admin privileges",
          duration: 5000,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update report. Please try again.",
          duration: 5000,
        })
      }
    }
  }

  const updateReportData = (field: string, value: any) => {
    const currentData = JSON.parse(editedReport.report)
    const newData = {
      ...currentData,
      incident_details: {
        ...currentData.incident_details,
        [field]: value,
      },
    }
    setEditedReport({
      ...editedReport,
      report: JSON.stringify(newData),
    })
  }

  const updateLocation = (field: string, value: string) => {
    const currentData = JSON.parse(editedReport.report)
    const newData = {
      ...currentData,
      incident_details: {
        ...currentData.incident_details,
        location: {
          ...currentData.incident_details.location,
          [field]: value,
        },
      },
    }
    setEditedReport({
      ...editedReport,
      report: JSON.stringify(newData),
    })
  }

  const currentData = JSON.parse(editedReport.report)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
          <DialogDescription>
            Update the report details
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={currentData.status}
              onValueChange={(value) => {
                const newData = {
                  ...currentData,
                  status: value,
                }
                setEditedReport({
                  ...editedReport,
                  report: JSON.stringify(newData),
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Incident Date</Label>
            <Input
              type="datetime-local"
              id="date"
              value={currentData.incident_details.date.split('.')[0]}
              onChange={(e) => updateReportData('date', new Date(e.target.value).toISOString())}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={currentData.incident_details.location.country}
              onChange={(e) => updateLocation('country', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentData.incident_details.description}
              onChange={(e) => updateReportData('description', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="violation_types">Violation Types</Label>
            <Select
              value={currentData.incident_details.violation_types[0]}
              onValueChange={(value) => updateReportData('violation_types', [value])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select violation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="discrimination">Discrimination</SelectItem>
                <SelectItem value="abuse">Abuse</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 