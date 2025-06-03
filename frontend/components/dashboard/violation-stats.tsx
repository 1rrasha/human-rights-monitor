"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Share } from "lucide-react"

export function ViolationStats() {
  const { theme } = useTheme()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const timelineRef = useRef<HTMLCanvasElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("types")

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Chart for violation types
  useEffect(() => {
    if (!chartRef.current || !isClient || activeTab !== "types") return

    const canvas = chartRef.current
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
        { label: "Arbitrary Detention", value: 42, color: "#008080" }, // teal
        { label: "Forced Displacement", value: 35, color: "#9333ea" }, // purple
        { label: "Torture", value: 28, color: "#f97316" }, // orange
        { label: "Property Destruction", value: 22, color: "#3b82f6" }, // blue
        { label: "Restriction of Assembly", value: 18, color: "#f59e0b" }, // amber
        { label: "Other", value: 15, color: "#10b981" }, // emerald
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

      // Animation progress (0 to 1)
      const now = Date.now()
      const animationDuration = 1000 // 1 second
      const animationProgress = Math.min(1, (now % (animationDuration * 10)) / animationDuration)

      data.forEach((item, i) => {
        const barHeight = (item.value / maxValue) * chartHeight * animationProgress
        const x = margin.left + i * (barWidth + barSpacing) + barSpacing / 2
        const y = margin.top + chartHeight - barHeight

        // Draw bar with gradient
        const gradient = ctx.createLinearGradient(x, y, x, margin.top + chartHeight)
        gradient.addColorStop(0, item.color)
        gradient.addColorStop(1, isDark ? "rgba(42, 42, 42, 0.5)" : "rgba(233, 236, 239, 0.5)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0])
        ctx.fill()

        // Draw value on top of bar
        ctx.fillStyle = textColor
        ctx.font = "bold 12px sans-serif"
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
  }, [theme, isClient, activeTab])

  // Timeline chart
  useEffect(() => {
    if (!timelineRef.current || !isClient || activeTab !== "timeline") return

    const canvas = timelineRef.current
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
      const lineColors = ["#008080", "#9333ea", "#f97316"] // teal, purple, orange
      const areaColors = ["rgba(0, 128, 128, 0.2)", "rgba(147, 51, 234, 0.2)", "rgba(249, 115, 22, 0.2)"]

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
        { key: "arbitrary", color: lineColors[0], areaColor: areaColors[0], label: "Arbitrary Detention" },
        { key: "displacement", color: lineColors[1], areaColor: areaColors[1], label: "Forced Displacement" },
        { key: "torture", color: lineColors[2], areaColor: areaColors[2], label: "Torture" },
      ]

      // Animation progress (0 to 1)
      const now = Date.now()
      const animationDuration = 1500 // 1.5 seconds
      const animationProgress = Math.min(1, (now % (animationDuration * 10)) / animationDuration)
      const animatedDataPoints = Math.floor(data.length * animationProgress)

      lines.forEach((line) => {
        // Draw area
        ctx.beginPath()
        ctx.moveTo(margin.left, margin.top + chartHeight)

        data.slice(0, animatedDataPoints + 1).forEach((item, i) => {
          const x = margin.left + i * xStep
          const y =
            margin.top + chartHeight - ((item[line.key as keyof typeof item] as number) / maxValue) * chartHeight

          if (i === 0) {
            ctx.lineTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })

        if (animatedDataPoints < data.length - 1) {
          ctx.lineTo(margin.left + animatedDataPoints * xStep, margin.top + chartHeight)
        } else {
          ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
        }

        ctx.closePath()
        ctx.fillStyle = line.areaColor
        ctx.fill()

        // Draw line
        ctx.beginPath()

        data.slice(0, animatedDataPoints + 1).forEach((item, i) => {
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
        data.slice(0, animatedDataPoints + 1).forEach((item, i) => {
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
  }, [theme, isClient, activeTab])

  return (
    <Card className="data-card">
      <CardHeader className="data-card-header">
        <CardTitle className="data-card-title">Violation Statistics</CardTitle>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Share className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="types" value={activeTab} onValueChange={setActiveTab} className="p-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="types">By Type</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          <TabsContent value="types" className="mt-4 h-[300px]">
            <canvas ref={chartRef} className="w-full h-full" />
          </TabsContent>
          <TabsContent value="timeline" className="mt-4 h-[300px]">
            <canvas ref={timelineRef} className="w-full h-full" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
