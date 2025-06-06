"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Case, UpdateCaseData } from "@/services/cases.service";
import { useState } from "react";

interface CaseEditProps {
  caseItem: Case;
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseItem: Case) => void;
}

export function CaseEdit({ caseItem, isOpen, onClose, onSave }: CaseEditProps) {
  const [editedCase, setEditedCase] = useState<Case>(caseItem);
  const [newViolationType, setNewViolationType] = useState("");
  const [newPerpetrator, setNewPerpetrator] = useState({ name: "", type: "" });
  const [newVictim, setNewVictim] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Handle violation types
  const addViolationType = () => {
    if (newViolationType && !editedCase.violation_types.includes(newViolationType)) {
      setEditedCase({
        ...editedCase,
        violation_types: [...editedCase.violation_types, newViolationType],
      });
      setNewViolationType("");
    }
  };

  const removeViolationType = (type: string) => {
    setEditedCase({
      ...editedCase,
      violation_types: editedCase.violation_types.filter((t) => t !== type),
    });
  };

  // Handle perpetrators
  const addPerpetrator = () => {
    if (newPerpetrator.name && newPerpetrator.type) {
      setEditedCase({
        ...editedCase,
        perpetrators: [...editedCase.perpetrators, newPerpetrator],
      });
      setNewPerpetrator({ name: "", type: "" });
    }
  };

  const removePerpetrator = (index: number) => {
    setEditedCase({
      ...editedCase,
      perpetrators: editedCase.perpetrators.filter((_, i) => i !== index),
    });
  };

  // Handle victims
  const addVictim = () => {
    if (newVictim && !editedCase.victims.includes(newVictim)) {
      setEditedCase({
        ...editedCase,
        victims: [...editedCase.victims, newVictim],
      });
      setNewVictim("");
    }
  };

  const removeVictim = (victim: string) => {
    setEditedCase({
      ...editedCase,
      victims: editedCase.victims.filter((v) => v !== victim),
    });
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSave = () => {
    const updateData: UpdateCaseData = {
      status: editedCase.status,
      priority: editedCase.priority,
      description: editedCase.description,
      violation_types: editedCase.violation_types,
      perpetrators: editedCase.perpetrators,
      victims: editedCase.victims,
      location: editedCase.location,
      date_occurred: editedCase.date_occurred,
      date_reported: editedCase.date_reported,
      title: editedCase.title,
      files: files.length > 0 ? files : undefined,
    };
    onSave({ ...editedCase, ...updateData });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Case</DialogTitle>
          <DialogDescription className="text-base">Make changes to the case information</DialogDescription>
        </DialogHeader>
        <div className="space-y-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="case_id" className="text-sm font-medium">Case ID</Label>
                <Input id="case_id" value={editedCase.case_id} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                  id="title"
                  value={editedCase.title}
                  onChange={(e) => setEditedCase({ ...editedCase, title: e.target.value })}
                  className="w-full"
                  placeholder="Enter case title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select
                  value={editedCase.status}
                  onValueChange={(value) => setEditedCase({ ...editedCase, status: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="under_investigation">Under Investigation</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                <Select
                  value={editedCase.priority}
                  onValueChange={(value) => setEditedCase({ ...editedCase, priority: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                <Input
                  id="country"
                  value={editedCase.location.country}
                  onChange={(e) =>
                    setEditedCase({
                      ...editedCase,
                      location: { ...editedCase.location, country: e.target.value },
                    })
                  }
                  className="w-full"
                  placeholder="Enter country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region" className="text-sm font-medium">Region</Label>
                <Input
                  id="region"
                  value={editedCase.location.region}
                  onChange={(e) =>
                    setEditedCase({
                      ...editedCase,
                      location: { ...editedCase.location, region: e.target.value },
                    })
                  }
                  className="w-full"
                  placeholder="Enter region"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordinates" className="text-sm font-medium">Coordinates</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      value={
                        editedCase.location.coordinates.latitude ||
                        editedCase.location.coordinates.coordinates?.[1] ||
                        ""
                      }
                      onChange={(e) =>
                        setEditedCase({
                          ...editedCase,
                          location: {
                            ...editedCase.location,
                            coordinates: {
                              ...editedCase.location.coordinates,
                              latitude: parseFloat(e.target.value),
                              coordinates: [
                                editedCase.location.coordinates.coordinates?.[0] || 0,
                                parseFloat(e.target.value),
                              ],
                            },
                          },
                        })
                      }
                      placeholder="Latitude"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      value={
                        editedCase.location.coordinates.longitude ||
                        editedCase.location.coordinates.coordinates?.[0] ||
                        ""
                      }
                      onChange={(e) =>
                        setEditedCase({
                          ...editedCase,
                          location: {
                            ...editedCase.location,
                            coordinates: {
                              ...editedCase.location.coordinates,
                              longitude: parseFloat(e.target.value),
                              coordinates: [
                                parseFloat(e.target.value),
                                editedCase.location.coordinates.coordinates?.[1] || 0,
                              ],
                            },
                          },
                        })
                      }
                      placeholder="Longitude"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={editedCase.description}
              onChange={(e) => setEditedCase({ ...editedCase, description: e.target.value })}
              className="min-h-[120px] resize-y"
              placeholder="Enter case description"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Violation Types</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newViolationType}
                  onChange={(e) => setNewViolationType(e.target.value)}
                  placeholder="Add violation type"
                  className="flex-1"
                />
                <Button onClick={addViolationType} className="whitespace-nowrap">Add Type</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {editedCase.violation_types.map((type, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/10 transition-colors"
                    onClick={() => removeViolationType(type)}
                  >
                    {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    <span className="ml-1 text-destructive">×</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Victims</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newVictim}
                  onChange={(e) => setNewVictim(e.target.value)}
                  placeholder="Add victim"
                  className="flex-1"
                />
                <Button onClick={addVictim} className="whitespace-nowrap">Add Victim</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {editedCase.victims.map((victim, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/10 transition-colors"
                    onClick={() => removeVictim(victim)}
                  >
                    {victim}
                    <span className="ml-1 text-destructive">×</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Perpetrators</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={newPerpetrator.name}
                  onChange={(e) =>
                    setNewPerpetrator({ ...newPerpetrator, name: e.target.value })
                  }
                  placeholder="Perpetrator name"
                />
                <Input
                  value={newPerpetrator.type}
                  onChange={(e) =>
                    setNewPerpetrator({ ...newPerpetrator, type: e.target.value })
                  }
                  placeholder="Perpetrator type"
                />
              </div>
              <Button onClick={addPerpetrator} className="mt-2">
                Add Perpetrator
              </Button>
              <div className="flex flex-wrap gap-2 mt-3">
                {editedCase.perpetrators.map((perpetrator, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/10 transition-colors"
                    onClick={() => removePerpetrator(index)}
                  >
                    {perpetrator.name} ({perpetrator.type})
                    <span className="ml-1 text-destructive">×</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Evidence Files</Label>
                <div className="flex flex-col gap-2">
                  <Input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" 
                  />
                  <div className="mt-2 space-y-1">
                    {files.map((file, index) => (
                      <div key={index} className="text-sm flex items-center gap-2">
                        <span className="text-muted-foreground">•</span>
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {editedCase.evidence.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Existing Evidence</Label>
                  <div className="space-y-2">
                    {editedCase.evidence.map((evidence, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded-md">
                        <div className="font-medium">{evidence.type}</div>
                        <div className="text-muted-foreground break-all">{evidence.url}</div>
                        {evidence.description && (
                          <div className="text-muted-foreground mt-1">{evidence.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
  );
}