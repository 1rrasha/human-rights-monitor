"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Calendar, FileUp, MapPin, Upload } from "lucide-react"
import { useCases } from "@/hooks/useCases"
import { CreateCaseData } from "@/services/cases.service"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

const violationTypes = [
  "arbitrary_detention",
  "forced_displacement",
  "torture",
  "property_destruction",
  "freedom_restriction",
  "other",
]

const priorities = ["high", "medium", "low"]

const statuses = ["new", "under_investigation", "resolved", "archived"]

export default function AddCasePage() {
  const [formData, setFormData] = useState<Partial<CreateCaseData>>({
    status: "new",
    priority: "medium",
    violation_types: [],
    location: { country: "", region: "", coordinates: {} },
    victims: [],
    perpetrators: [],
    evidence: [],
    files: [],
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { createCase, isCreating, createError } = useCases()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles([...uploadedFiles, ...newFiles])
      setFormData({ ...formData, files: [...(formData.files || []), ...newFiles] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.title || !formData.description || !formData.location?.country || !formData.location?.region) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      })
      return
    }

    try {
      await createCase(formData as CreateCaseData, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Case created successfully.",
          })
          router.push("/cases")
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to create case.",
          })
        },
      })
    } catch (error) {
      console.error("Submission error:", error)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Case</CardTitle>
          <CardDescription>Enter the details of the human rights violation case</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="case-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Case Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter case title"
                    required
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the case..."
                  className="min-h-[150px]"
                  required
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Violation Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {violationTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.violation_types?.includes(type) || false}
                        onCheckedChange={(checked) => {
                          const updatedTypes = checked
                            ? [...(formData.violation_types || []), type]
                            : (formData.violation_types || []).filter((t) => t !== type)
                          setFormData({ ...formData, violation_types: updatedTypes })
                        }}
                      />
                      <Label htmlFor={type} className="text-sm">
                        {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Information</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Enter country"
                    required
                    value={formData.location?.country || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location!, country: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region/Governorate</Label>
                  <Input
                    id="region"
                    placeholder="Enter region or governorate"
                    required
                    value={formData.location?.region || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location!, region: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coordinates">Coordinates</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      className="pl-9"
                      value={formData.location?.coordinates?.latitude || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location!,
                            coordinates: {
                              ...formData.location!.coordinates,
                              latitude: parseFloat(e.target.value) || undefined,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      className="pl-9"
                      value={formData.location?.coordinates?.longitude || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location!,
                            coordinates: {
                              ...formData.location!.coordinates,
                              longitude: parseFloat(e.target.value) || undefined,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dates</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-occurred">Date Occurred</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date-occurred"
                      type="date"
                      className="pl-9"
                      required
                      value={formData.date_occurred?.split("T")[0] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, date_occurred: new Date(e.target.value).toISOString() })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-reported">Date Reported</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date-reported"
                      type="date"
                      className="pl-9"
                      required
                      value={formData.date_reported?.split("T")[0] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, date_reported: new Date(e.target.value).toISOString() })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Victims */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Victims</h3>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="victims">Victim Information</Label>
                <Textarea
                  id="victims"
                  placeholder="Enter victim names or identifiers (one per line)..."
                  className="min-h-[100px]"
                  value={formData.victims?.join("\n") || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, victims: e.target.value.split("\n").filter((v) => v.trim()) })
                  }
                />
              </div>
            </div>

            {/* Perpetrators */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Perpetrators</h3>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="perpetrators">Perpetrator Information</Label>
                <Textarea
                  id="perpetrators"
                  placeholder="Enter perpetrator information (format: Name, Type per line)..."
                  className="min-h-[100px]"
                  value={formData.perpetrators
                    ?.map((p) => `${p.name}, ${p.type}`)
                    .join("\n") || ""}
                  onChange={(e) => {
                    const perpetrators = e.target.value
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((line) => {
                        const [name, type] = line.split(",").map((s) => s.trim())
                        return { name: name || "Unknown", type: type || "Unknown" }
                      })
                    setFormData({ ...formData, perpetrators })
                  }}
                />
              </div>
            </div>

            {/* Evidence Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Evidence Upload</h3>
              <Separator />

              <div className="space-y-2">
                <Label>Upload Photos, Videos, or Documents</Label>
                <div
                  className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">Supports images, videos, PDFs, and documents</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Uploaded Files</Label>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <FileUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => {
                              const updatedFiles = uploadedFiles.filter((_, i) => i !== index)
                              setUploadedFiles(updatedFiles)
                              setFormData({ ...formData, files: updatedFiles })
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Priority</h3>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="priority">Case Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" disabled={isCreating}>
            Save as Draft
          </Button>
          <Button type="submit" form="case-form" disabled={isCreating}>
            {isCreating ? "Submitting..." : "Submit Case"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}