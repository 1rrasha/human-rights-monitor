import api from '../config/api';

export interface Report {
  _id: string;
  report_id: string;
  reporter_type: string;
  anonymous: boolean;
  contact_info: {
    email: string;
    phone: string;
    preferred_contact: string;
  };
  incident_details: {
    date: string;
    location: {
      country: string;
      city: string;
      coordinates: Record<string, any>;
    };
    description: string;
    violation_types: string[];
  };
  evidence: Array<{
    type: string;
    url: string;
    description: string;
    date_captured: string;
  }>;
  status: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReportData {
  report: string;
  files?: File[];
}

export interface UpdateReportData {
  report: string;
  files?: File[];
}

export interface ReportsQueryParams {
  status?: string | null;
  location?: string | null;
  violation_type?: string | null;
  skip?: number;
  limit?: number;
}

export interface ReportAnalytics {
  violation_type: string;
  count: number;
}

export interface ValidationError {
  detail: Array<{
    loc: [string, number];
    msg: string;
    type: string;
  }>;
}

export const createReport = async (data: CreateReportData): Promise<Report> => {
  const formData = new FormData();
  formData.append('report', data.report);
  if (data.files) {
    data.files.forEach((file) => {
      formData.append('files', file);
    });
  }
  const response = await api.post('/reports/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getReports = async (params: ReportsQueryParams = {}): Promise<Report[]> => {
  const response = await api.get('/reports/', { params });
  return response.data;
};

export const getReport = async (reportId: string): Promise<Report> => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

export const updateReport = async (reportId: string, data: UpdateReportData): Promise<Report> => {
  const formData = new FormData();
  formData.append('report', data.report);
  if (data.files) {
    data.files.forEach((file) => {
      formData.append('files', file);
    });
  }
  const response = await api.patch(`/reports/${reportId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getReportAnalytics = async (): Promise<ReportAnalytics[]> => {
  const response = await api.get('/reports/analytics');
  return response.data;
}; 