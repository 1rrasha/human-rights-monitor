"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Calendar, Check, FileUp, MapPin, Shield, Upload, User } from "lucide-react"
import { useRef, useState } from "react"

export function ReportForm() {
  const [reporterType, setReporterType] = useState("victim")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => file.name)
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
  }

  return (
    <Tabs defaultValue="report" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="report" className="gap-2">
          <Shield className="h-4 w-4" />
          <span>Report Incident</span>
        </TabsTrigger>
        <TabsTrigger value="track" className="gap-2">
          <Check className="h-4 w-4" />
          <span>Track Report</span>
        </TabsTrigger>
        <TabsTrigger value="emergency" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Emergency</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="report" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Report a Human Rights Violation</CardTitle>
            <CardDescription>
              Provide details about the incident. Your information will be kept confidential.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Enter your phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-method">Preferred Contact Method</Label>
                    <Select defaultValue="email">
                      <SelectTrigger id="contact-method">
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
                  <Label htmlFor="incident-date">Date of Incident</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="incident-date" type="date" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="violation-type">Type of Violation</Label>
                  <Select>
                    <SelectTrigger id="violation-type">
                      <SelectValue placeholder="Select violation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arbitrary_detention">Arbitrary Detention</SelectItem>
                      <SelectItem value="forced_displacement">Forced Displacement</SelectItem>
                      <SelectItem value="torture">Torture</SelectItem>
                      <SelectItem value="property_destruction">Property Destruction</SelectItem>
                      <SelectItem value="freedom_restriction">Freedom Restriction</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="location" placeholder="Enter location of incident" className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description of Incident</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of what happened..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perpetrators">Alleged Perpetrators (if known)</Label>
                <Textarea
                  id="perpetrators"
                  placeholder="Provide information about who committed the violation..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Victim Information */}
            {reporterType !== "victim" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Victim Information</h3>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="victim-name">Victim Name (if known)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="victim-name" placeholder="Enter victim's name" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="victim-count">Number of Victims</Label>
                    <Input id="victim-count" type="number" min="1" defaultValue="1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="victim-details">Additional Victim Details</Label>
                  <Textarea
                    id="victim-details"
                    placeholder="Age, gender, occupation, or other relevant information..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}

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
                          <span className="text-sm">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Consent */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Consent</h3>
              <Separator />

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox id="consent-processing" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="consent-processing" className="text-sm">
                      I consent to the processing of my personal data for the purpose of investigating this human rights
                      violation.
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="consent-sharing" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="consent-sharing" className="text-sm">
                      I consent to sharing this information with relevant authorities and partner organizations if
                      necessary for the investigation.
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="consent-truthful" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="consent-truthful" className="text-sm">
                      I confirm that the information provided is truthful and accurate to the best of my knowledge.
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Save as Draft</Button>
            <Button>Submit Report</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="track" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Track Your Report</CardTitle>
            <CardDescription>Enter your report ID to check the status of your submission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-id">Report ID</Label>
              <Input id="report-id" placeholder="Enter your report ID (e.g., IR-2023-0789)" />
            </div>
            <Button className="w-full">Track Report</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="emergency" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Reporting</CardTitle>
            <CardDescription>Use this form for urgent situations requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-950 dark:border-red-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h3 className="font-medium text-red-600 dark:text-red-400">Emergency Hotlines</h3>
              </div>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                For immediate assistance, please contact one of these emergency hotlines:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
                <li>• Emergency Hotline: +1-555-123-4567</li>
                <li>• WhatsApp/Signal: +1-555-987-6543</li>
                <li>• Email: emergency@hrm.org</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency-description">Describe the Emergency</Label>
              <Textarea
                id="emergency-description"
                placeholder="Provide details about the urgent situation..."
                className="min-h-[150px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency-location">Location</Label>
                <Input id="emergency-location" placeholder="Where is this happening?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-contact">Your Contact Information</Label>
                <Input id="emergency-contact" placeholder="How can we reach you?" />
              </div>
            </div>

            <Button className="w-full bg-red-600 hover:bg-red-700">Submit Emergency Report</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
