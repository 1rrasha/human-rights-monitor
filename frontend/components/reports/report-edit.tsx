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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Report, UpdateReportData } from "@/services/analytics.service"

interface ReportEditProps {
  report: Report
  isOpen: boolean
  onClose: () => void
  onSave: (reportId: string, data: UpdateReportData) => void
}

export function ReportEdit({ report, isOpen, onClose, onSave }: ReportEditProps) {
  const [editedReport, setEditedReport] = useState<UpdateReportData>({
    report_update: {
      status: report.status,
      assigned_to: report.assigned_to,
    },
  })

  const handleSave = () => {
    onSave(report._id, editedReport)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
          <DialogDescription>
            Update the report information
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={editedReport.report_update.status}
              onValueChange={(value) =>
                setEditedReport({
                  ...editedReport,
                  report_update: { ...editedReport.report_update, status: value },
                })
              }
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
            <Label htmlFor="assigned_to">Assigned To</Label>
            <Input
              id="assigned_to"
              value={editedReport.report_update.assigned_to}
              onChange={(e) =>
                setEditedReport({
                  ...editedReport,
                  report_update: {
                    ...editedReport.report_update,
                    assigned_to: e.target.value,
                  },
                })
              }
            />
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