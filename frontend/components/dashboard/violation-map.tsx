"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react"

export function ViolationMap() {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !isClient) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.clientWidth
      canvas.height = 400
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Draw map
    const drawMap = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set colors based on theme
      const isDark = theme === "dark"
      const bgColor = isDark ? "#1a1a1a" : "#f8f9fa"
      const borderColor = isDark ? "#333" : "#ddd"
      const landColor = isDark ? "#2a2a2a" : "#e9ecef"
      const waterColor = isDark ? "#1a1a1a" : "#f1f8fe"
      const textColor = isDark ? "#fff" : "#333"
      const hotspotColors = [
        "rgba(220, 38, 38, 0.7)", // red
        "rgba(234, 88, 12, 0.7)", // orange
        "rgba(234, 179, 8, 0.7)", // yellow
      ]

      // Apply zoom
      ctx.save()
      ctx.scale(zoom, zoom)

      // Center the map when zoomed
      const centerX = canvas.width / 2 / zoom
      const centerY = canvas.height / 2 / zoom
      const offsetX = centerX - canvas.width / 2
      const offsetY = centerY - canvas.height / 2
      ctx.translate(-offsetX * (zoom - 1), -offsetY * (zoom - 1))

      // Draw background (water)
      ctx.fillStyle = waterColor
      ctx.fillRect(0, 0, canvas.width / zoom, canvas.height / zoom)

      // Draw simplified map (just for illustration)
      ctx.fillStyle = landColor
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 1

      // Draw a simplified Middle East map shape
      ctx.beginPath()
      ctx.moveTo((canvas.width * 0.2) / zoom, (canvas.height * 0.2) / zoom)
      ctx.lineTo((canvas.width * 0.4) / zoom, (canvas.height * 0.15) / zoom)
      ctx.lineTo((canvas.width * 0.6) / zoom, (canvas.height * 0.2) / zoom)
      ctx.lineTo((canvas.width * 0.8) / zoom, (canvas.height * 0.3) / zoom)
      ctx.lineTo((canvas.width * 0.7) / zoom, (canvas.height * 0.5) / zoom)
      ctx.lineTo((canvas.width * 0.8) / zoom, (canvas.height * 0.7) / zoom)
      ctx.lineTo((canvas.width * 0.6) / zoom, (canvas.height * 0.8) / zoom)
      ctx.lineTo((canvas.width * 0.4) / zoom, (canvas.height * 0.75) / zoom)
      ctx.lineTo((canvas.width * 0.3) / zoom, (canvas.height * 0.6) / zoom)
      ctx.lineTo((canvas.width * 0.2) / zoom, (canvas.height * 0.4) / zoom)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw country borders
      ctx.beginPath()
      ctx.moveTo((canvas.width * 0.4) / zoom, (canvas.height * 0.3) / zoom)
      ctx.lineTo((canvas.width * 0.6) / zoom, (canvas.height * 0.4) / zoom)
      ctx.lineTo((canvas.width * 0.5) / zoom, (canvas.height * 0.6) / zoom)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo((canvas.width * 0.5) / zoom, (canvas.height * 0.2) / zoom)
      ctx.lineTo((canvas.width * 0.5) / zoom, (canvas.height * 0.7) / zoom)
      ctx.stroke()

      // Draw hotspots (violation clusters)
      const hotspots = [
        {
          x: (canvas.width * 0.3) / zoom,
          y: (canvas.height * 0.3) / zoom,
          radius: 20,
          intensity: 0,
          name: "Northern Syria",
          count: 42,
        },
        {
          x: (canvas.width * 0.6) / zoom,
          y: (canvas.height * 0.25) / zoom,
          radius: 15,
          intensity: 1,
          name: "Eastern Syria",
          count: 28,
        },
        {
          x: (canvas.width * 0.5) / zoom,
          y: (canvas.height * 0.5) / zoom,
          radius: 25,
          intensity: 0,
          name: "Central Region",
          count: 65,
        },
        {
          x: (canvas.width * 0.7) / zoom,
          y: (canvas.height * 0.6) / zoom,
          radius: 18,
          intensity: 2,
          name: "Southern Yemen",
          count: 19,
        },
        {
          x: (canvas.width * 0.4) / zoom,
          y: (canvas.height * 0.65) / zoom,
          radius: 12,
          intensity: 1,
          name: "Western Yemen",
          count: 31,
        },
      ]

      // Get current time for animations
      const now = Date.now() / 1000

      hotspots.forEach((spot) => {
        // Draw hotspot
        ctx.beginPath()
        ctx.fillStyle = hotspotColors[spot.intensity]
        ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2)
        ctx.fill()

        // Add pulsing effect
        const pulseSize = Math.sin(now * 2 + spot.x) * 5 + 5

        ctx.beginPath()
        ctx.strokeStyle = hotspotColors[spot.intensity].replace("0.7", "0.3")
        ctx.lineWidth = 2
        ctx.arc(spot.x, spot.y, spot.radius + pulseSize, 0, Math.PI * 2)
        ctx.stroke()

        // Draw count in center
        ctx.fillStyle = "#fff"
        ctx.font = "bold 12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(spot.count.toString(), spot.x, spot.y)

        // Draw name below
        ctx.fillStyle = textColor
        ctx.font = "10px sans-serif"
        ctx.fillText(spot.name, spot.x, spot.y + spot.radius + 10)
      })

      // Add country labels
      ctx.fillStyle = textColor
      ctx.font = "bold 14px sans-serif"
      ctx.fillText("Syria", (canvas.width * 0.35) / zoom, (canvas.height * 0.4) / zoom)
      ctx.fillText("Yemen", (canvas.width * 0.55) / zoom, (canvas.height * 0.6) / zoom)

      // Restore canvas state
      ctx.restore()
    }

    // Initial draw
    drawMap()

    // Redraw on theme change
    const interval = setInterval(drawMap, 100)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [theme, isClient, zoom])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6))
  }

  const handleReset = () => {
    setZoom(1)
  }

  return (
    <Card className="data-card">
      <CardHeader className="data-card-header">
        <CardTitle className="data-card-title">Violation Map</CardTitle>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={handleZoomOut} className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
            <span className="sr-only">Zoom out</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn} className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
            <span className="sr-only">Zoom in</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset} className="h-8 w-8">
            <RotateCw className="h-4 w-4" />
            <span className="sr-only">Reset</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="interactive-map">
          <canvas ref={canvasRef} className="w-full h-full" />
          <div className="map-overlay" />
          <div className="map-legend">
            <div className="font-medium mb-1">Violation Intensity:</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-70"></div>
              <span>High (50+)</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-orange-500 opacity-70"></div>
              <span>Medium (25-49)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-70"></div>
              <span>Low (1-24)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
