"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useVictims, useCasesForVictimSelection } from "@/hooks/useVictims"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle2 } from "lucide-react"

const riskLevels = ["high", "medium", "low"]
const genders = ["male", "female", "other"]
const ethnicities = ["Kurdish", "Arab", "Other"]
const supportTypes = ["legal", "medical", "psychological", "financial"]
const supportStatuses = ["active", "pending", "completed"]
const threatTypes = ["intimidation", "surveillance", "physical", "verbal", "digital", "other"]

interface VictimData {
  type: string
  anonymous: boolean
  demographics: {
    gender: string
    age: string // Kept as string for form handling
    ethnicity: string
    occupation: string
  }
  contact_info: {
    email: string
    phone: string
    secure_messaging: string
  }
  cases_involved: string[]
  risk_assessment: {
    level: string
    threats: string[]
    protection_needed: boolean
  }
  support_services: Array<{
    type: string
    provider: string
    status: string
  }>
}

export default function AddVictimPage() {
  const [formData, setFormData] = useState<VictimData>({
    type: "victim",
    anonymous: false,
    demographics: {
      gender: "",
      age: "",
      ethnicity: "",
      occupation: ""
    },
    contact_info: {
      email: "",
      phone: "",
      secure_messaging: ""
    },
    cases_involved: [""],
    risk_assessment: {
      level: "medium",
      threats: [],
      protection_needed: false
    },
    support_services: [
      {
        type: "legal",
        provider: "",
        status: "active"
      }
    ]
  })
  const [validationErrors, setValidationErrors] = useState<{
    gender?: string
    age?: string
    ethnicity?: string
    email?: string
    case_id?: string
  }>({})
  const router = useRouter()
  const { cases } = useCasesForVictimSelection()
  const { createVictim, isCreating, createError } = useVictims(formData.cases_involved[0] || "")

  const validateForm = () => {
    const errors: {
      gender?: string
      age?: string
      ethnicity?: string
      email?: string
      case_id?: string
    } = {}

    if (!formData.demographics.gender) {
      errors.gender = "Gender is required"
    }
    if (!formData.demographics.age) {
      errors.age = "Age is required"
    } else if (isNaN(Number(formData.demographics.age)) || Number(formData.demographics.age) <= 0) {
      errors.age = "Age must be a positive number"
    }
    if (!formData.demographics.ethnicity) {
      errors.ethnicity = "Ethnicity is required"
    }
    if (!formData.contact_info.email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_info.email)) {
      errors.email = "Invalid email format"
    }
    if (!formData.cases_involved[0]) {
      errors.case_id = "A related case is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
      })
      return
    }

    try {
      // Prepare data for backend API
      const apiData = {
        type: formData.type,
        anonymous: formData.anonymous,
        demographics: {
          gender: formData.demographics.gender,
          age: Number(formData.demographics.age), // Convert to number
          ethnicity: formData.demographics.ethnicity,
          occupation: formData.demographics.occupation
        },
        contact_info: {
          email: formData.contact_info.email,
          phone: formData.contact_info.phone,
          secure_messaging: formData.contact_info.secure_messaging
        },
        cases_involved: [formData.cases_involved[0]], // Ensure array
        risk_assessment: {
          level: formData.risk_assessment.level,
          threats: formData.risk_assessment.threats,
          protection_needed: formData.risk_assessment.protection_needed
        },
        support_services: formData.support_services
      }

      await createVictim(apiData)
      
      // Show success toast with animation
      toast({
        title: "Success!",
        description: "Victim has been added successfully",
        duration: 2000,
        className: "bg-green-50 border-green-200",
        icon: <CheckCircle2 className="h-5 w-5 text-green-500 animate-bounce" />,
      })

      // Navigate to victims page after a short delay
      setTimeout(() => {
        router.push("/victims")
      }, 1500)
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Victim</CardTitle>
          <CardDescription>Enter the details of the victim</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="victim-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Demographics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Demographics</h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.demographics.gender}
                    onValueChange={(value) => {
                      setFormData({ ...formData, demographics: { ...formData.demographics, gender: value } })
                      setValidationErrors(prev => ({ ...prev, gender: undefined }))
                    }}
                  >
                    <SelectTrigger id="gender" className={validationErrors.gender ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.gender && (
                    <p className="text-sm text-red-500">{validationErrors.gender}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    required
                    value={formData.demographics.age}
                    onChange={(e) => {
                      setFormData({ ...formData, demographics: { ...formData.demographics, age: e.target.value } })
                      setValidationErrors(prev => ({ ...prev, age: undefined }))
                    }}
                    className={validationErrors.age ? "border-red-500" : ""}
                  />
                  {validationErrors.age && (
                    <p className="text-sm text-red-500">{validationErrors.age}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ethnicity">Ethnicity *</Label>
                  <Select
                    value={formData.demographics.ethnicity}
                    onValueChange={(value) => {
                      setFormData({ ...formData, demographics: { ...formData.demographics, ethnicity: value } })
                      setValidationErrors(prev => ({ ...prev, ethnicity: undefined }))
                    }}
                  >
                    <SelectTrigger id="ethnicity" className={validationErrors.ethnicity ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      {ethnicities.map((ethnicity) => (
                        <SelectItem key={ethnicity} value={ethnicity}>
                          {ethnicity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.ethnicity && (
                    <p className="text-sm text-red-500">{validationErrors.ethnicity}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    placeholder="Enter occupation"
                    value={formData.demographics.occupation}
                    onChange={(e) => setFormData({ ...formData, demographics: { ...formData.demographics, occupation: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    required
                    value={formData.contact_info.email}
                    onChange={(e) => {
                      setFormData({ ...formData, contact_info: { ...formData.contact_info, email: e.target.value } })
                      setValidationErrors(prev => ({ ...prev, email: undefined }))
                    }}
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.contact_info.phone}
                    onChange={(e) => setFormData({ ...formData, contact_info: { ...formData.contact_info, phone: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secure_messaging">Secure Messaging</Label>
                  <Input
                    id="secure_messaging"
                    placeholder="Enter secure messaging platform"
                    value={formData.contact_info.secure_messaging}
                    onChange={(e) => setFormData({ ...formData, contact_info: { ...formData.contact_info, secure_messaging: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Case Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Case Information</h3>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="case_id">Related Case *</Label>
                <Select
                  value={formData.cases_involved[0]}
                  onValueChange={(value) => {
                    setFormData({ ...formData, cases_involved: [value] })
                    setValidationErrors(prev => ({ ...prev, case_id: undefined }))
                  }}
                >
                  <SelectTrigger id="case_id" className={validationErrors.case_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select case" />
                  </SelectTrigger>
                  <SelectContent>
                    {cases?.map((caseItem) => (
                      <SelectItem key={caseItem.case_id} value={caseItem.case_id}>
                        {caseItem.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.case_id && (
                  <p className="text-sm text-red-500">{validationErrors.case_id}</p>
                )}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Risk Assessment</h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="risk_level">Risk Level</Label>
                  <Select
                    value={formData.risk_assessment.level}
                    onValueChange={(value) => setFormData({ ...formData, risk_assessment: { ...formData.risk_assessment, level: value } })}
                  >
                    <SelectTrigger id="risk_level">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      {riskLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threats">Threats</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.risk_assessment.threats.includes(value)) {
                        setFormData({
                          ...formData,
                          risk_assessment: {
                            ...formData.risk_assessment,
                            threats: [...formData.risk_assessment.threats, value]
                          }
                        })
                      }
                    }}
                  >
                    <SelectTrigger id="threats">
                      <SelectValue placeholder="Add threat" />
                    </SelectTrigger>
                    <SelectContent>
                      {threatTypes.map((threat) => (
                        <SelectItem key={threat} value={threat}>
                          {threat.charAt(0).toUpperCase() + threat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.risk_assessment.threats.map((threat) => (
                      <div
                        key={threat}
                        className="flex items-center text-white gap-1 bg-secondary px-2 py-1 rounded-md"
                      >
                        <span>{threat}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              risk_assessment: {
                                ...formData.risk_assessment,
                                threats: formData.risk_assessment.threats.filter((t) => t !== threat)
                              }
                            })
                          }}
                          className="text-sm hover:text-white text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protection_needed">Protection Needed</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="protection_needed"
                      checked={formData.risk_assessment.protection_needed}
                      onChange={(e) => setFormData({ ...formData, risk_assessment: { ...formData.risk_assessment, protection_needed: e.target.checked } })}
                    />
                    <Label htmlFor="protection_needed">Yes</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Support Services</h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support_type">Service Type</Label>
                  <Select
                    value={formData.support_services[0].type}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      support_services: [{ ...formData.support_services[0], type: value }]
                    })}
                  >
                    <SelectTrigger id="support_type">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    placeholder="Enter service provider"
                    value={formData.support_services[0].provider}
                    onChange={(e) => setFormData({
                      ...formData,
                      support_services: [{ ...formData.support_services[0], provider: e.target.value }]
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_status">Status</Label>
                  <Select
                    value={formData.support_services[0].status}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      support_services: [{ ...formData.support_services[0], status: value }]
                    })}
                  >
                    <SelectTrigger id="service_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            type="submit"
            form="victim-form"
            disabled={isCreating}
          >
            {isCreating ? "Submitting..." : "Submit Victim"}
          </Button>
          {Object.keys(validationErrors).length > 0 && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</p>
              <ul className="list-disc list-inside text-sm text-red-700">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {createError && (
            <p className="text-sm text-red-500 mt-2">
              {createError.message || "Failed to submit victim. Please try again."}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}