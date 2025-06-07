"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AnalyticsQueryParams } from "@/services/analytics.service";
import { useViolations, useGeodata } from "@/hooks/useAnalytics";

interface FiltersProps {
  onFilterChange: (params: AnalyticsQueryParams) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [violationType, setViolationType] = useState<string | undefined>(undefined);

  // Fetch data for filters
  const { violations, isLoading: isViolationsLoading } = useViolations();
  const { geodata, isLoading: isGeodataLoading } = useGeodata();

  // Extract unique countries from geodata
  const countries = Array.from(new Set(geodata?.data.map(item => item.country) || [])).sort();

  // Extract unique violation types from violations
  const violationTypes = Array.from(new Set(violations?.data.map(item => item.violation_type) || [])).sort();

  const handleApplyFilters = () => {
    const params: AnalyticsQueryParams = {
      start_date: startDate ? startDate.toISOString() : undefined,
      end_date: endDate ? endDate.toISOString() : undefined,
      country: country !== "all" ? country : undefined,
      violation_type: violationType !== "all" ? violationType : undefined,
    };
    onFilterChange(params);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            className="w-[140px] p-2 border rounded-md text-sm"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate || undefined}
            endDate={endDate}
            minDate={startDate || undefined}
            placeholderText="End Date"
            className="w-[140px] p-2 border rounded-md text-sm"
          />
        </div>

        <Select value={country || "all"} onValueChange={setCountry} disabled={isGeodataLoading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={violationType || "all"} onValueChange={setViolationType} disabled={isViolationsLoading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Violation Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {violationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2" onClick={handleApplyFilters}>
          <Filter className="h-4 w-4" />
          <span>Apply Filters</span>
        </Button>
      </div>
    </div>
  );
}