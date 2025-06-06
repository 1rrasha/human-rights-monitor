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
import { File, Pencil, MapPin } from "lucide-react"
import { getFileUrl, isDocumentFile } from "@/services/files.service"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
// Import react-leaflet components for OpenStreetMap
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
// Import Leaflet for custom marker icon
import L from "leaflet"

interface ReportDetailsProps {
  report: {
    _id: string
    report_id: string
    status: string
    reporter_type: string
    anonymous: boolean
    incident_details: {
      date: string
      location: {
        country: string
        region: string
        coordinates?: {
          coordinates?: [number, number] // [longitude, latitude]
        }
        city?: string
      }
      description: string
      violation_types: string[]
    }
    evidence: Array<{
      date_captured: string
      description: string | null
      type: string
      url: string
    }>
    created_at: string
    updated_at: string
  }
  isOpen: boolean
  onClose: () => void
  onEdit?: (report: ReportDetailsProps['report']) => void
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

export function ReportDetails({ report, isOpen, onClose, onEdit }: ReportDetailsProps) {
  const { theme } = useTheme()
  const [isClient, setIsClient] = useState(false)

  // Ensure rendering only on client-side to avoid SSR issues with Leaflet
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Custom marker icon for Leaflet
  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  })

  // Get coordinates for the map
  const coordinates = report.incident_details.location.coordinates?.coordinates
  const hasCoordinates = coordinates && coordinates.length === 2
  const [lng, lat] = hasCoordinates ? coordinates : [0, 0] // [longitude, latitude]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
          <DialogDescription>
            View all information about this report
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Basic Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Report ID:</span> {report.report_id}</p>
                <p><span className="font-medium">Status:</span> {getStatusBadge(report.status)}</p>
                <p><span className="font-medium">Reporter Type:</span> {report.reporter_type}</p>
                <p><span className="font-medium">Anonymous:</span> {report.anonymous ? "Yes" : "No"}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Location</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Country:</span> {report.incident_details.location.country}</p>
                <p><span className="font-medium">Region:</span> {report.incident_details.location.region}</p>
                {hasCoordinates && (
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {lat.toFixed(4)}, {lng.toFixed(4)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Map section with Leaflet */}
          {isClient && (
            <div className="space-y-2">
              <h3 className="font-medium">Location Map</h3>
              {hasCoordinates ? (
                <div className="interactive-map" style={{ height: "300px", width: "100%" }}>
                  <MapContainer
                    center={[lat, lng]} // Center on [latitude, longitude]
                    zoom={10}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[lat, lng]} icon={markerIcon}>
                      <Popup>
                        {report.incident_details.location.city ||
                          report.incident_details.location.country}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <p className="text-muted-foreground">No coordinates available for this incident.</p>
              )}
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Incident Description</h3>
            <p className="text-muted-foreground">{report.incident_details.description}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Violation Types</h3>
            <div className="flex flex-wrap gap-2">
              {report.incident_details.violation_types.map((type, index) => (
                <Badge key={index} variant="secondary">
                  {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Evidence</h3>
            <div className="space-y-4">
              {report.evidence.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <File className="h-4 w-4" />
                    <span className="font-medium">Evidence #{index + 1}</span>
                  </div>
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
              <h3 className="font-medium mb-2">Incident Date</h3>
              <div className="space-y-2">
                <p>{new Date(report.incident_details.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Report Timeline</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Created:</span> {new Date(report.created_at).toLocaleString()}</p>
                <p><span className="font-medium">Last Updated:</span> {new Date(report.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => onEdit(report)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit Report
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}