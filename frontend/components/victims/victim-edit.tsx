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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Victim, UpdateVictimData } from "@/services/victims.service"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface VictimEditProps {
  victim: Victim
  isOpen: boolean
  onClose: () => void
  onSave: (victim: Victim, updateData: UpdateVictimData) => void
}

export function VictimEdit({ victim, isOpen, onClose, onSave }: VictimEditProps) {
  const [editedVictim, setEditedVictim] = useState<Victim>(victim)
  const [newThreat, setNewThreat] = useState("")
  const [newSupportService, setNewSupportService] = useState({ type: "", provider: "", status: "active" })

  // Handle threats
  const addThreat = () => {
    if (newThreat && !editedVictim.risk_assessment.threats.includes(newThreat)) {
      setEditedVictim({
        ...editedVictim,
        risk_assessment: {
          ...editedVictim.risk_assessment,
          threats: [...editedVictim.risk_assessment.threats, newThreat],
        },
      })
      setNewThreat("")
    }
  }

  const removeThreat = (threat: string) => {
    setEditedVictim({
      ...editedVictim,
      risk_assessment: {
        ...editedVictim.risk_assessment,
        threats: editedVictim.risk_assessment.threats.filter((t) => t !== threat),
      },
    })
  }

  // Handle support services
  const addSupportService = () => {
    if (newSupportService.type && newSupportService.provider) {
      setEditedVictim({
        ...editedVictim,
        support_services: [...editedVictim.support_services, newSupportService],
      })
      setNewSupportService({ type: "", provider: "", status: "active" })
    }
  }

  const removeSupportService = (index: number) => {
    setEditedVictim({
      ...editedVictim,
      support_services: editedVictim.support_services.filter((_, i) => i !== index),
    })
  }

  const handleSave = () => {
    const updateData: UpdateVictimData = {
      anonymous: editedVictim.anonymous,
      demographics: editedVictim.demographics,
      risk_assessment: editedVictim.risk_assessment,
      support_services: editedVictim.support_services,
      contact_info: editedVictim.contact_info,
    }
    onSave(editedVictim, updateData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Victim</DialogTitle>
          <DialogDescription className="text-base">Make changes to the victim information</DialogDescription>
        </DialogHeader>
        <div className="space-y-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="victim_id" className="text-sm font-medium">Victim ID</Label>
                <Input id="victim_id" value={editedVictim._id} disabled className="bg-muted" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={editedVictim.anonymous}
                  onCheckedChange={(checked) =>
                    setEditedVictim({ ...editedVictim, anonymous: checked as boolean })
                  }
                />
                <Label htmlFor="anonymous" className="text-sm font-medium">Anonymous</Label>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                <Select
                  value={editedVictim.demographics.gender}
                  onValueChange={(value) =>
                    setEditedVictim({
                      ...editedVictim,
                      demographics: { ...editedVictim.demographics, gender: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={editedVictim.demographics.age}
                  onChange={(e) =>
                    setEditedVictim({
                      ...editedVictim,
                      demographics: { ...editedVictim.demographics, age: parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ethnicity" className="text-sm font-medium">Ethnicity</Label>
                <Input
                  id="ethnicity"
                  value={editedVictim.demographics.ethnicity}
                  onChange={(e) =>
                    setEditedVictim({
                      ...editedVictim,
                      demographics: { ...editedVictim.demographics, ethnicity: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation" className="text-sm font-medium">Occupation</Label>
                <Input
                  id="occupation"
                  value={editedVictim.demographics.occupation}
                  onChange={(e) =>
                    setEditedVictim({
                      ...editedVictim,
                      demographics: { ...editedVictim.demographics, occupation: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Risk Assessment</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="risk_level" className="text-sm font-medium">Risk Level</Label>
                  <Select
                    value={editedVictim.risk_assessment.level}
                    onValueChange={(value) =>
                      setEditedVictim({
                        ...editedVictim,
                        risk_assessment: { ...editedVictim.risk_assessment, level: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="protection_needed"
                    checked={editedVictim.risk_assessment.protection_needed}
                    onCheckedChange={(checked) =>
                      setEditedVictim({
                        ...editedVictim,
                        risk_assessment: {
                          ...editedVictim.risk_assessment,
                          protection_needed: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label htmlFor="protection_needed" className="text-sm font-medium">Protection Needed</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Threats</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newThreat}
                  onChange={(e) => setNewThreat(e.target.value)}
                  placeholder="Add threat"
                  className="flex-1"
                />
                <Button onClick={addThreat} className="whitespace-nowrap">Add Threat</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {editedVictim.risk_assessment.threats.map((threat, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/10 transition-colors"
                    onClick={() => removeThreat(threat)}
                  >
                    {threat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    <span className="ml-1 text-destructive">×</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Support Services</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  value={newSupportService.type}
                  onChange={(e) =>
                    setNewSupportService({ ...newSupportService, type: e.target.value })
                  }
                  placeholder="Service type"
                />
                <Input
                  value={newSupportService.provider}
                  onChange={(e) =>
                    setNewSupportService({ ...newSupportService, provider: e.target.value })
                  }
                  placeholder="Provider"
                />
                <Select
                  value={newSupportService.status}
                  onValueChange={(value) =>
                    setNewSupportService({ ...newSupportService, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addSupportService} className="mt-2">
                Add Service
              </Button>
              <div className="space-y-2 mt-3">
                {editedVictim.support_services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div>
                      <span className="font-medium">{service.type}</span>
                      <span className="text-muted-foreground ml-2">({service.provider})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{service.status}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeSupportService(index)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Contact Information</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedVictim.contact_info.email}
                    onChange={(e) =>
                      setEditedVictim({
                        ...editedVictim,
                        contact_info: { ...editedVictim.contact_info, email: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                  <Input
                    id="phone"
                    value={editedVictim.contact_info.phone}
                    onChange={(e) =>
                      setEditedVictim({
                        ...editedVictim,
                        contact_info: { ...editedVictim.contact_info, phone: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secure_messaging" className="text-sm font-medium">Secure Messaging</Label>
                  <Input
                    id="secure_messaging"
                    value={editedVictim.contact_info.secure_messaging}
                    onChange={(e) =>
                      setEditedVictim({
                        ...editedVictim,
                        contact_info: { ...editedVictim.contact_info, secure_messaging: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
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