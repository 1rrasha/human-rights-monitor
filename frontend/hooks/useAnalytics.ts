
import { useQuery } from '@tanstack/react-query';
import { analyticsService, AnalyticsQueryParams, ViolationsResponse, GeodataResponse, TimelineResponse } from '../services/analytics.service';

// Hook for fetching violations data
export const useViolations = (params?: AnalyticsQueryParams) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['violations', params],
    queryFn: () => analyticsService.getViolations(params),
  });

  return {
    violations: data as ViolationsResponse | undefined,
    isLoading,
    error,
  };
};

// Hook for fetching geodata
export const useGeodata = (params?: AnalyticsQueryParams) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['geodata', params],
    queryFn: () => analyticsService.getGeodata(params),
  });

  return {
    geodata: data as GeodataResponse | undefined,
    isLoading,
    error,
  };
};

// Hook for fetching timeline data
export const useTimeline = (params?: AnalyticsQueryParams) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['timeline', params],
    queryFn: () => analyticsService.getTimeline(params),
  });

  return {
    timeline: data as TimelineResponse | undefined,
    isLoading,
    error,
  };
};

