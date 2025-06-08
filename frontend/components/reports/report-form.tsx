"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { createReport } from "@/services/reports.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Calendar, FileUp, MapPin, Shield, Upload, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"

// Fix Leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Coordinates {
  lat: number
  lng: number
}

export function ReportForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [reporterType, setReporterType] = useState("victim")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    preferred_contact: "email",
    date: "",
    country: "",
    city: "",
    description: "",
    violation_types: [""],
    coordinates: null as Coordinates | null
  })

  // Map click handler component
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setFormData(prev => ({
          ...prev,
          coordinates: { lat: e.latlng.lat, lng: e.latlng.lng }
        }))
      }
    })
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string, id: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: id === "violation_types" ? [value] : value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredFields = {
      date: "Date of Incident",
      city: "Location",
      description: "Description of Incident",
      violation_types: "Type of Violation"
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => {
        if (key === "violation_types") {
          return !formData.violation_types[0] || formData.violation_types[0] === ""
        }
        return !formData[key as keyof typeof formData]
      })
      .map(([_, label]) => label)

    if (missingFields.length > 0) {
      const message = `Please fill in the following required fields: ${missingFields.join(", ")}`
      setErrorMessage(message)
      toast({
        title: "Missing Required Fields",
        description: message,
        variant: "destructive",
        duration: 5000
      })
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const reportData = {
        reporter_type: reporterType,
        anonymous: isAnonymous,
        contact_info: !isAnonymous ? {
          email: formData.email,
          phone: formData.phone,
          preferred_contact: formData.preferred_contact
        } : undefined,
        incident_details: {
          date: new Date(formData.date).toISOString(),
          location: {
            country: formData.country,
            city: formData.city,
            coordinates: formData.coordinates || {}
          },
          description: formData.description,
          violation_types: [formData.violation_types[0]]
        },
        evidence: uploadedFiles.map(file => ({
          type: file.type.split('/')[0] || 'unknown',
          url: URL.createObjectURL(file),
          description: "",
          date_captured: new Date().toISOString()
        }))
      }

      const response = await createReport({
        report: JSON.stringify(reportData),
        files: uploadedFiles
      })

      setIsSuccess(true)
      toast({
        title: "Report Submitted Successfully",
        description: `Your report has been submitted with ID: ${response.report_id}. You can track its status using this ID.`,
        duration: 5000
      })

      // Reset form
      setFormData({
        email: "",
        phone: "",
        preferred_contact: "email",
        date: "",
        country: "",
        city: "",
        description: "",
        violation_types: [""],
        coordinates: null
      })
      setUploadedFiles([])
      setReporterType("victim")
      setIsAnonymous(false)

      // Navigate after a short delay to show the success animation
      setTimeout(() => {
        router.push('/reports')
      }, 2000)

    } catch (error: any) {
      console.error('Report submission error:', error, error.response?.data)
      const errorMsg = error.response?.data?.detail?.[0]?.msg ||
                       error.response?.data?.detail ||
                       "An error occurred while submitting your report. Please try again."
      setErrorMessage(errorMsg)
      toast({
        title: "Error Submitting Report",
        description: errorMsg,
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Report a Human Rights Violation
        </CardTitle>
        <CardDescription>
          Provide details about the incident. Your information will be kept confidential.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
              >
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-semibold"
                  >
                    Report Submitted Successfully!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground"
                  >
                    Redirecting to reports page...
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Reporter Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Reporter Information</h3>
            <Separator />
            <div className="space-y-2">
              <Label>I am reporting as a:</Label>
              <RadioGroup defaultValue="victim" className="flex flex-col space-y-1" onValueChange={setReporterType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="victim" id="reporter-victim" />
                  <Label htmlFor="reporter-victim">Victim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="witness" id="reporter-witness" />
                  <Label htmlFor="reporter-witness">Witness</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="relative" id="reporter-relative" />
                  <Label htmlFor="reporter-relative">Relative of victim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ngo" id="reporter-ngo" />
                  <Label htmlFor="reporter-ngo">NGO representative</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="reporter-other" />
                  <Label htmlFor="reporter-other">Other</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              />
              <Label htmlFor="anonymous">I wish to remain anonymous</Label>
            </div>
            {!isAnonymous && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
                  <Select
                    value={formData.preferred_contact}
                    onValueChange={(value) => handleSelectChange(value, "preferred_contact")}
                  >
                    <SelectTrigger id="preferred_contact">
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="signal">Signal</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Incident Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Incident Details</h3>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date of Incident</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-9"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="violation_types">Type of Violation</Label>
                <Select
                  value={formData.violation_types[0]}
                  onValueChange={(value) => handleSelectChange(value, "violation_types")}
                >
                  <SelectTrigger id="violation_types">
                    <SelectValue placeholder="Select violation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arbitrary_detention">Arbitrary Detention</SelectItem>
                    <SelectItem value="forced_displacement">Forced Displacement</SelectItem>
                    <SelectItem value="torture">Torture</SelectItem>
                    <SelectItem value="property_destruction">Property Destruction</SelectItem>
                    <SelectItem value="freedom_restriction">Freedom Restriction</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="city"
                    placeholder="Enter city"
                    className="pl-9"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Select Location on Map (Optional)</Label>
              <div className="h-64 rounded-md overflow-hidden border border-muted">
                <MapContainer
                  center={[51.505, -0.09]} // Default center (London)
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  className="z-10"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler />
                  {formData.coordinates && (
                    <Marker position={[formData.coordinates.lat, formData.coordinates.lng]} />
                  )}
                </MapContainer>
              </div>
              {formData.coordinates && (
                <p className="text-sm text-muted-foreground">
                  Selected: Lat {formData.coordinates.lat.toFixed(4)}, Lng {formData.coordinates.lng.toFixed(4)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description of Incident</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of what happened..."
                className="min-h-[150px]"
                value={formData.description}
                onChange={handleInputChange}
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
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
              </div>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <FileUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
          {errorMessage && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {errorMessage}
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}