"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Filter } from "lucide-react"

export function AnalyticsDashboard() {
  const { theme } = useTheme()
  const violationTypeChartRef = useRef<HTMLCanvasElement>(null)
  const timelineChartRef = useRef<HTMLCanvasElement>(null)
  const demographicsChartRef = useRef<HTMLCanvasElement>(null)
  const locationChartRef = useRef<HTMLCanvasElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Violation Types Chart
  useEffect(() => {
    if (!violationTypeChartRef.current || !isClient) return

    const canvas = violationTypeChartRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.clientWidth
      canvas.height = 300
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Draw chart
    const drawChart = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set colors based on theme
      const isDark = theme === "dark"
      const textColor = isDark ? "#fff" : "#333"
      const gridColor = isDark ? "#333" : "#ddd"

      const data = [
        { label: "Arbitrary Detention", value: 42, color: "#ff6384" },
        { label: "Forced Displacement", value: 35, color: "#36a2eb" },
        { label: "Torture", value: 28, color: "#ffce56" },
        { label: "Property Destruction", value: 22, color: "#4bc0c0" },
        { label: "Restriction of Assembly", value: 18, color: "#9966ff" },
        { label: "Other", value: 15, color: "#ff9f40" },
      ]

      const margin = { top: 20, right: 20, bottom: 60, left: 60 }
      const chartWidth = canvas.width - margin.left - margin.right
      const chartHeight = canvas.height - margin.top - margin.bottom

      // Draw axes
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1

      // Y-axis
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top)
      ctx.lineTo(margin.left, margin.top + chartHeight)
      ctx.stroke()

      // X-axis
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top + chartHeight)
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
      ctx.stroke()

      // Draw bars
      const barWidth = (chartWidth / data.length) * 0.7
      const barSpacing = (chartWidth / data.length) * 0.3
      const maxValue = Math.max(...data.map((d) => d.value))

      data.forEach((item, i) => {
        const barHeight = (item.value / maxValue) * chartHeight
        const x = margin.left + i * (barWidth + barSpacing) + barSpacing / 2
        const y = margin.top + chartHeight - barHeight

        // Draw bar
        ctx.fillStyle = item.color
        ctx.fillRect(x, y, barWidth, barHeight)

        // Draw value on top of bar
        ctx.fillStyle = textColor
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5)

        // Draw label below x-axis
        ctx.save()
        ctx.translate(x + barWidth / 2, margin.top + chartHeight + 10)
        ctx.rotate(Math.PI / 4) // Rotate text for better fit
        ctx.textAlign = "left"
        ctx.fillText(item.label, 0, 0)
        ctx.restore()
      })

      // Draw y-axis labels
      ctx.fillStyle = textColor
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"

      for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxValue * i) / 5)
        const y = margin.top + chartHeight - (chartHeight * i) / 5

        ctx.fillText(value.toString(), margin.left - 10, y)

        // Draw grid line
        ctx.beginPath()
        ctx.strokeStyle = gridColor
        ctx.setLineDash([2, 2])
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Initial draw
    drawChart()

    // Redraw on theme change or resize
    const interval = setInterval(drawChart, 100)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [theme, isClient])

  // Timeline Chart
  useEffect(() => {
    if (!timelineChartRef.current || !isClient) return

    const canvas = timelineChartRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.clientWidth
      canvas.height = 300
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Draw timeline
    const drawTimeline = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set colors based on theme
      const isDark = theme === "dark"
      const textColor = isDark ? "#fff" : "#333"
      const gridColor = isDark ? "#333" : "#ddd"

      const data = [
        { month: "Jan", arbitrary: 12, displacement: 8, torture: 5 },
        { month: "Feb", arbitrary: 15, displacement: 10, torture: 7 },
        { month: "Mar", arbitrary: 18, displacement: 12, torture: 8 },
        { month: "Apr", arbitrary: 22, displacement: 15, torture: 10 },
        { month: "May", arbitrary: 25, displacement: 18, torture: 12 },
        { month: "Jun", arbitrary: 20, displacement: 15, torture: 10 },
        { month: "Jul", arbitrary: 18, displacement: 12, torture: 8 },
        { month: "Aug", arbitrary: 15, displacement: 10, torture: 7 },
        { month: "Sep", arbitrary: 18, displacement: 12, torture: 8 },
        { month: "Oct", arbitrary: 22, displacement: 15, torture: 10 },
        { month: "Nov", arbitrary: 25, displacement: 18, torture: 12 },
        { month: "Dec", arbitrary: 28, displacement: 20, torture: 15 },
      ]

      const margin = { top: 20, right: 20, bottom: 40, left: 40 }
      const chartWidth = canvas.width - margin.left - margin.right
      const chartHeight = canvas.height - margin.top - margin.bottom

      // Draw axes
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1

      // Y-axis
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top)
      ctx.lineTo(margin.left, margin.top + chartHeight)
      ctx.stroke()

      // X-axis
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top + chartHeight)
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
      ctx.stroke()

      // Calculate max value for y-axis
      const maxValue = Math.max(...data.map((d) => Math.max(d.arbitrary, d.displacement, d.torture)))
      const xStep = chartWidth / (data.length - 1)

      // Draw lines
      const lines = [
        { key: "arbitrary", color: "#ff6384", label: "Arbitrary Detention" },
        { key: "displacement", color: "#36a2eb", label: "Forced Displacement" },
        { key: "torture", color: "#ffce56", label: "Torture" },
      ]

      lines.forEach((line) => {
        // Draw line
        ctx.beginPath()

        data.forEach((item, i) => {
          const x = margin.left + i * xStep
          const y =
            margin.top + chartHeight - ((item[line.key as keyof typeof item] as number) / maxValue) * chartHeight

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })

        ctx.strokeStyle = line.color
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw points
        data.forEach((item, i) => {
          const x = margin.left + i * xStep
          const y =
            margin.top + chartHeight - ((item[line.key as keyof typeof item] as number) / maxValue) * chartHeight

          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fillStyle = "#fff"
          ctx.fill()
          ctx.strokeStyle = line.color
          ctx.lineWidth = 2
          ctx.stroke()
        })
      })

      // Draw x-axis labels
      ctx.fillStyle = textColor
      ctx.textAlign = "center"
      ctx.textBaseline = "top"

      data.forEach((item, i) => {
        const x = margin.left + i * xStep
        ctx.fillText(item.month, x, margin.top + chartHeight + 10)
      })

      // Draw y-axis labels
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"

      for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxValue * i) / 5)
        const y = margin.top + chartHeight - (chartHeight * i) / 5

        ctx.fillText(value.toString(), margin.left - 10, y)

        // Draw grid line
        ctx.beginPath()
        ctx.strokeStyle = gridColor
        ctx.setLineDash([2, 2])
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Draw legend
      const legendX = margin.left + 20
      const legendY = margin.top + 20

      lines.forEach((line, i) => {
        const y = legendY + i * 20

        // Line
        ctx.beginPath()
        ctx.moveTo(legendX, y)
        ctx.lineTo(legendX + 20, y)
        ctx.strokeStyle = line.color
        ctx.lineWidth = 2
        ctx.stroke()

        // Point
        ctx.beginPath()
        ctx.arc(legendX + 10, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#fff"
        ctx.fill()
        ctx.strokeStyle = line.color
        ctx.lineWidth = 2
        ctx.stroke()

        // Label
        ctx.fillStyle = textColor
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.fillText(line.label, legendX + 30, y)
      })
    }

    // Initial draw
    drawTimeline()

    // Redraw on theme change or resize
    const interval = setInterval(drawTimeline, 100)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [theme, isClient])

  // Demographics Chart
  useEffect(() => {
    if (!demographicsChartRef.current || !isClient) return

    const canvas = demographicsChartRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.clientWidth
      canvas.height = 300
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Draw pie chart
    const drawPieChart = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set colors based on theme
      const isDark = theme === "dark"
      const textColor = isDark ? "#fff" : "#333"

      const data = [
        { label: "Male", value: 45, color: "#36a2eb" },
        { label: "Female", value: 35, color: "#ff6384" },
        { label: "Children", value: 20, color: "#ffce56" },
      ]

      const total = data.reduce((sum, item) => sum + item.value, 0)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(centerX, centerY) * 0.7

      let startAngle = 0

      // Draw pie slices
      data.forEach((item) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()

        ctx.fillStyle = item.color
        ctx.fill()

        // Draw label
        const labelAngle = startAngle + sliceAngle / 2
        const labelRadius = radius * 0.7
        const labelX = centerX + Math.cos(labelAngle) * labelRadius
        const labelY = centerY + Math.sin(labelAngle) * labelRadius

        ctx.fillStyle = "#fff"
        ctx.font = "bold 14px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${Math.round((item.value / total) * 100)}%`, labelX, labelY)

        startAngle += sliceAngle
      })

      // Draw legend
      const legendX = centerX - radius
      const legendY = centerY + radius * 1.2

      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"

      data.forEach((item, i) => {
        const x = legendX + i * (canvas.width / 3)

        // Color box
        ctx.fillStyle = item.color
        ctx.fillRect(x, legendY, 12, 12)

        // Label
        ctx.fillStyle = textColor
        ctx.fillText(`${item.label} (${item.value})`, x + 20, legendY + 6)
      })

      // Draw title
      ctx.fillStyle = textColor
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Victim Demographics", centerX, centerY - radius - 20)
    }

    // Initial draw
    drawPieChart()

    // Redraw on theme change or resize
    const interval = setInterval(drawPieChart, 100)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [theme, isClient])

  // Location Chart
  useEffect(() => {
    if (!locationChartRef.current || !isClient) return

    const canvas = locationChartRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.clientWidth
      canvas.height = 300
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
      const textColor = isDark ? "#fff" : "#333"

      // Draw background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw simplified map (just for illustration)
      ctx.fillStyle = landColor
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 1

      // Draw a simplified Middle East map shape
      ctx.beginPath()
      ctx.moveTo(canvas.width * 0.2, canvas.height * 0.2)
      ctx.lineTo(canvas.width * 0.4, canvas.height * 0.15)
      ctx.lineTo(canvas.width * 0.6, canvas.height * 0.2)
      ctx.lineTo(canvas.width * 0.8, canvas.height * 0.3)
      ctx.lineTo(canvas.width * 0.7, canvas.height * 0.5)
      ctx.lineTo(canvas.width * 0.8, canvas.height * 0.7)
      ctx.lineTo(canvas.width * 0.6, canvas.height * 0.8)
      ctx.lineTo(canvas.width * 0.4, canvas.height * 0.75)
      ctx.lineTo(canvas.width * 0.3, canvas.height * 0.6)
      ctx.lineTo(canvas.width * 0.2, canvas.height * 0.4)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw country borders
      ctx.beginPath()
      ctx.moveTo(canvas.width * 0.4, canvas.height * 0.3)
      ctx.lineTo(canvas.width * 0.6, canvas.height * 0.4)
      ctx.lineTo(canvas.width * 0.5, canvas.height * 0.6)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(canvas.width * 0.5, canvas.height * 0.2)
      ctx.lineTo(canvas.width * 0.5, canvas.height * 0.7)
      ctx.stroke()

      // Draw hotspots (violation clusters)
      const hotspots = [
        { x: canvas.width * 0.3, y: canvas.height * 0.3, radius: 20, count: 42, label: "Northern Syria" },
        { x: canvas.width * 0.6, y: canvas.height * 0.25, radius: 15, count: 28, label: "Eastern Syria" },
        { x: canvas.width * 0.5, y: canvas.height * 0.5, radius: 25, count: 65, label: "Central Region" },
        { x: canvas.width * 0.7, y: canvas.height * 0.6, radius: 18, count: 37, label: "Southern Yemen" },
        { x: canvas.width * 0.4, y: canvas.height * 0.65, radius: 12, count: 23, label: "Western Yemen" },
      ]

      hotspots.forEach((spot) => {
        // Calculate color based on count (red gradient)
        const intensity = Math.min(1, spot.count / 70)
        const r = Math.floor(255 * intensity)
        const g = Math.floor(100 * (1 - intensity))
        const b = Math.floor(100 * (1 - intensity))
        const color = `rgba(${r}, ${g}, ${b}, 0.7)`

        // Draw hotspot
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2)
        ctx.fill()

        // Draw count
        ctx.fillStyle = "#fff"
        ctx.font = "bold 12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(spot.count.toString(), spot.x, spot.y)

        // Draw label
        ctx.fillStyle = textColor
        ctx.font = "10px sans-serif"
        ctx.fillText(spot.label, spot.x, spot.y + spot.radius + 10)
      })

      // Add title
      ctx.fillStyle = textColor
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Violations by Location", canvas.width / 2, 20)

      // Add legend
      const legendX = 20
      const legendY = canvas.height - 60

      ctx.fillStyle = textColor
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("Violation Count:", legendX, legendY)

      const legendColors = [
        { label: "High (50+)", color: "rgba(255, 50, 50, 0.7)" },
        { label: "Medium (25-49)", color: "rgba(255, 150, 50, 0.7)" },
        { label: "Low (1-24)", color: "rgba(255, 200, 50, 0.7)" },
      ]

      legendColors.forEach((item, i) => {
        const y = legendY + 20 + i * 15

        // Color circle
        ctx.beginPath()
        ctx.fillStyle = item.color
        ctx.arc(legendX + 10, y - 4, 6, 0, Math.PI * 2)
        ctx.fill()

        // Label
        ctx.fillStyle = textColor
        ctx.fillText(item.label, legendX + 25, y)
      })
    }

    // Initial draw
    drawMap()

    // Redraw on theme change or resize
    const interval = setInterval(drawMap, 100)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [theme, isClient])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Select defaultValue="last30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="last90">Last 90 days</SelectItem>
              <SelectItem value="thisyear">This year</SelectItem>
              <SelectItem value="alltime">All time</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="syria">Syria</SelectItem>
              <SelectItem value="yemen">Yemen</SelectItem>
              <SelectItem value="north">Northern Regions</SelectItem>
              <SelectItem value="south">Southern Regions</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </Button>
        </div>

        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>Custom Date Range</span>
        </Button>
      </div>

      <Tabs defaultValue="violations">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Violations by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <canvas ref={violationTypeChartRef} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Violations Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <canvas ref={timelineChartRef} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Victim Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <canvas ref={demographicsChartRef} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Violations by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <canvas ref={locationChartRef} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
