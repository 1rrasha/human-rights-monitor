import api from '../config/api';

// Interface for query parameters shared across endpoints
export interface AnalyticsQueryParams {
  start_date?: string; // Date-time string
  end_date?: string; // Date-time string
  country?: string;
  violation_type?: string; // Only for violations and timeline
}

// Interface for violations response
export interface ViolationsResponse {
  data: Array<{
    violation_type: string;
    count: number;
  }>;
  chart_spec: Record<string, any>; // Generic object for chart configuration
}

// Interface for geodata response
export interface GeodataResponse {
  data: Array<{
    country: string;
    count: number;
    coordinates: {
      lon: number;
      lat: number;
    } | null;
  }>;
  chart_spec: Record<string, any>;
}

// Interface for timeline response
export interface TimelineResponse {
  data: Array<{
    date: string; // Date-time string
    count: number;
  }>;
  chart_spec: Record<string, any>;
}

export const analyticsService = {
  // Fetch violations data
  getViolations: async (params?: AnalyticsQueryParams): Promise<ViolationsResponse> => {
    const response = await api.get<ViolationsResponse>('/analytics/violations', { params });
    return response.data;
  },

  // Fetch geodata
  getGeodata: async (params?: AnalyticsQueryParams): Promise<GeodataResponse> => {
    const response = await api.get<GeodataResponse>('/analytics/geodata', { params });
    return response.data;
  },

  // Fetch timeline data
  getTimeline: async (params?: AnalyticsQueryParams): Promise<TimelineResponse> => {
    const response = await api.get<TimelineResponse>('/analytics/timeline', { params });
    return response.data;
  },
};
