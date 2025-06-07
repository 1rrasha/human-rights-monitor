"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViolations, useGeodata, useTimeline } from "@/hooks/useAnalytics";
import { AnalyticsHeader } from "@/components/analytics/analytics-header";
import { Filters } from "@/components/analytics/Filters";
import Plotly from "plotly.js-dist-min";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { Loader2 } from "lucide-react";
import {  AnalyticsQueryParams } from '../../services/analytics.service';
export function AnalyticsDashboard() {
  const [filterParams, setFilterParams] = useState<AnalyticsQueryParams>({});
  const [activeTab, setActiveTab] = useState("violations");
  const violationsRef = useRef<HTMLDivElement>(null);
  const geodataRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const { violations, isLoading: isViolationsLoading, error: violationsError } = useViolations(filterParams);
  const { geodata, isLoading: isGeodataLoading, error: geodataError } = useGeodata(filterParams);
  const { timeline, isLoading: isTimelineLoading, error: timelineError } = useTimeline(filterParams);

  // Render Plotly charts
  const renderChart = (ref: React.RefObject<HTMLDivElement>, data: any, layout: any) => {
    if (ref.current && data && layout) {
      // Use Plotly.react to update existing charts or create new ones
      Plotly.react(ref.current, data, layout, { responsive: true });
    }
  };

  // Chart rendering with useEffect, triggered by data or active tab
  useEffect(() => {
    if (violations && violationsRef.current && activeTab === "violations") {
      renderChart(violationsRef, violations.chart_spec.data, violations.chart_spec.layout);
    }
  }, [violations, activeTab]);

  useEffect(() => {
    if (geodata && geodataRef.current && activeTab === "locations") {
      renderChart(geodataRef, geodata.chart_spec.data, geodata.chart_spec.layout);
    }
  }, [geodata, activeTab]);

  useEffect(() => {
    if (timeline && timelineRef.current && activeTab === "timeline") {
      renderChart(timelineRef, timeline.chart_spec.data, timeline.chart_spec.layout);
    }
  }, [timeline, activeTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (violationsRef.current) Plotly.purge(violationsRef.current);
      if (geodataRef.current) Plotly.purge(geodataRef.current);
      if (timelineRef.current) Plotly.purge(timelineRef.current);
    };
  }, []);

  // Export to PDF
  const exportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const margin = 10;
    let yOffset = 10;

    pdf.setFontSize(16);
    pdf.text("Analytics Report", width / 2, yOffset, { align: "center" });
    yOffset += 10;

    const addChartToPDF = async (ref: React.RefObject<HTMLDivElement>, title: string) => {
      if (ref.current) {
        const canvas = await html2canvas(ref.current);
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = width - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yOffset + imgHeight + 20 > pdf.internal.pageSize.getHeight()) {
          pdf.addPage();
          yOffset = 10;
        }

        pdf.setFontSize(12);
        pdf.text(title, margin, yOffset);
        yOffset += 5;
        pdf.addImage(imgData, "PNG", margin, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10;
      }
    };

    await addChartToPDF(violationsRef, "Violations by Type");
    await addChartToPDF(geodataRef, "Violations by Location");
    await addChartToPDF(timelineRef, "Violations Over Time");

    pdf.save("analytics_report.pdf");
  };

  // Export to Excel
  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    if (violations?.data) {
      const violationsSheet = XLSX.utils.json_to_sheet(
        violations.data.map((item) => ({
          Violation_Type: item.violation_type,
          Count: item.count,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, violationsSheet, "Violations");
    }

    if (geodata?.data) {
      const geodataSheet = XLSX.utils.json_to_sheet(
        geodata.data.map((item) => ({
          Country: item.country,
          Count: item.count,
          Latitude: item.coordinates?.lat ?? "N/A",
          Longitude: item.coordinates?.lon ?? "N/A",
        }))
      );
      XLSX.utils.book_append_sheet(workbook, geodataSheet, "Geodata");
    }

    if (timeline?.data) {
      const timelineSheet = XLSX.utils.json_to_sheet(
        timeline.data.map((item) => ({
          Date: item.date,
          Count: item.count,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, timelineSheet, "Timeline");
    }

    XLSX.writeFile(workbook, "analytics_report.xlsx");
  };

  return (
    <div className="space-y-6">
      <AnalyticsHeader onExportPDF={exportPDF} onExportExcel={exportExcel} />
      <Filters onFilterChange={setFilterParams} />

      <Tabs defaultValue="violations" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Violations by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {isViolationsLoading ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-lg">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-sm text-gray-500">Loading Violations Data...</p>
                </div>
              ) : violationsError ? (
                <div className="flex items-center justify-center h-[400px] text-red-500">
                  Error: {violationsError.message}
                </div>
              ) : (
                <div ref={violationsRef} className="h-[400px]" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Violations by Location</CardTitle>
            </CardHeader>
            <CardContent>
              {isGeodataLoading ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-lg">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-sm text-gray-500">Loading Location Data...</p>
                </div>
              ) : geodataError ? (
                <div className="flex items-center justify-center h-[400px] text-red-500">
                  Error: {geodataError.message}
                </div>
              ) : (
                <div ref={geodataRef} className="h-[400px]" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Violations Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {isTimelineLoading ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-lg">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-sm text-gray-500">Loading Timeline Data...</p>
                </div>
              ) : timelineError ? (
                <div className="flex items-center justify-center h-[400px] text-red-500">
                  Error: {timelineError.message}
                </div>
              ) : (
                <div ref={timelineRef} className="h-[400px]" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}