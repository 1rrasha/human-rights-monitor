"use client";

import { Button } from "@/components/ui/button";
import { Download, Share } from "lucide-react";

interface AnalyticsHeaderProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
}

export function AnalyticsHeader({ onExportPDF, onExportExcel }: AnalyticsHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-pattern" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="animate-slide-down">
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-white/80 mt-1">
              Explore trends and patterns in human rights violation data
            </p>
          </div>
          <div className="flex gap-2 animate-slide-in-right">
            <Button 
              variant="outline" 
              className="gap-2 z-50 bg-white text-primary hover:bg-white/90" 
              onClick={() => alert("Share functionality coming soon!")}
            >
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 z-50 bg-white text-primary hover:bg-white/90" 
              onClick={onExportPDF}
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 z-50 bg-white text-primary hover:bg-white/90" 
              onClick={onExportExcel}
            >
              <Download className="h-4 w-4" />
              <span>Export Excel</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}