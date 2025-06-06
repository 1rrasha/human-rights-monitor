"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Users, Image, Video, File } from "lucide-react"
import { Case } from "@/services/cases.service"
import { getFileUrl, isImageFile, isVideoFile, isDocumentFile } from "@/services/files.service"

interface CaseDetailsProps {
  caseItem: Case
  isOpen: boolean
  onClose: () => void
  onEdit: (caseItem: Case) => void
  onArchive: (caseItem: Case) => void
}

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
    case "archived":
      return (
        <Badge variant="outline" className="status-badge status-badge-archived">
          Archived
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

export function CaseDetails({ caseItem, isOpen, onClose, onEdit, onArchive }: CaseDetailsProps) {


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Case Details</DialogTitle>
          <DialogDescription>
            View all information about this case
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Basic Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Case ID:</span> {caseItem.case_id}</p>
                <p><span className="font-medium">Title:</span> {caseItem.title}</p>
                <p><span className="font-medium">Status:</span> {getStatusBadge(caseItem.status)}</p>
                <p><span className="font-medium">Priority:</span> {getPriorityBadge(caseItem.priority)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Location</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Country:</span> {caseItem.location.country}</p>
                <p><span className="font-medium">Region:</span> {caseItem.location.region}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{caseItem.description}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Violation Types</h3>
            <div className="flex flex-wrap gap-2">
              {caseItem.violation_types.map((type, index) => (
                <Badge key={index} variant="secondary">
                  {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Victims</h3>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{caseItem.victims.length} victims</span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Evidence</h3>
            <div className="space-y-4">
              {caseItem.evidence.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {isImageFile(item.url) && <Image className="h-4 w-4" />}
                    {isVideoFile(item.url) && <Video className="h-4 w-4" />}
                    {isDocumentFile(item.url) && <File className="h-4 w-4" />}
                    <span className="font-medium">Evidence #{index + 1}</span>
                  </div>
                  
                  {isImageFile(item.url) && (
                    <img 
                      src={getFileUrl(item.url)} 
                      alt={`Evidence ${index + 1}`}
                      className="max-w-full h-auto rounded-lg md:max-w-[500px] mx-auto"
                    />
                  )}
                  
                  {isVideoFile(item.url) && (
                    <video 
                      src={getFileUrl(item.url)}
                      controls
                      className="max-w-full rounded-lg md:max-w-[500px] mx-auto"
                    />
                  )}
                  
                  {isDocumentFile(item.url) && (
                    <a 
                      href={getFileUrl(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Document
                    </a>
                  )}
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Captured: {new Date(item.date_captured).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Dates</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Occurred:</span> {new Date(caseItem.date_occurred).toLocaleDateString()}</p>
                <p><span className="font-medium">Reported:</span> {new Date(caseItem.date_reported).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Created</h3>
              <div className="space-y-2">
                <p><span className="font-medium">By:</span> {caseItem.created_by_user.full_name}</p>
                <p><span className="font-medium">At:</span> {new Date(caseItem.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => {
            onClose()
            onEdit(caseItem)
          }}>
            Edit Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 