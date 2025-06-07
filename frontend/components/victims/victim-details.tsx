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
import { Victim } from "@/services/victims.service"

interface VictimDetailsProps {
  victim: Victim
  isOpen: boolean
  onClose: () => void
  onEdit: (victim: Victim) => void
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

export function VictimDetails({ victim, isOpen, onClose, onEdit }: VictimDetailsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Victim Details</DialogTitle>
          <DialogDescription>
            View all information about this victim
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Basic Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Victim ID:</span> {victim._id}</p>
                <p><span className="font-medium">Anonymous:</span> {victim.anonymous ? "Yes" : "No"}</p>
                {victim.pseudonym && (
                  <p><span className="font-medium">Pseudonym:</span> {victim.pseudonym}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Demographics</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Gender:</span> {victim.demographics.gender}</p>
                <p><span className="font-medium">Age:</span> {victim.demographics.age}</p>
                <p><span className="font-medium">Ethnicity:</span> {victim.demographics.ethnicity}</p>
                <p><span className="font-medium">Occupation:</span> {victim.demographics.occupation}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Risk Assessment</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Risk Level:</span> {getRiskLevelBadge(victim.risk_assessment.level)}</p>
              <p><span className="font-medium">Protection Needed:</span> {victim.risk_assessment.protection_needed ? "Yes" : "No"}</p>
              {victim.risk_assessment.threats.length > 0 && (
                <div>
                  <span className="font-medium">Threats:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {victim.risk_assessment.threats.map((threat, index) => (
                      <Badge key={index} variant="secondary">
                        {threat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Support Services</h3>
            <div className="space-y-4">
              {victim.support_services.map((service, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{service.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">Provider: {service.provider}</p>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Contact Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {victim.contact_info.email}</p>
              <p><span className="font-medium">Phone:</span> {victim.contact_info.phone}</p>
              <p><span className="font-medium">Secure Messaging:</span> {victim.contact_info.secure_messaging}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Cases Involved</h3>
            <div className="flex flex-wrap gap-2">
              {victim.cases_involved.map((caseId, index) => (
                <Badge key={index} variant="outline" className="font-mono">
                  {caseId}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Created</h3>
              <div className="space-y-2">
                <p><span className="font-medium">At:</span> {new Date(victim.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Last Updated</h3>
              <div className="space-y-2">
                <p><span className="font-medium">At:</span> {new Date(victim.updated_at).toLocaleString()}</p>
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
            onEdit(victim)
          }}>
            Edit Victim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 