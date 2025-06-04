import api from '../config/api';

export interface Case {
  _id: string;
  case_id: string;
  title: string;
  description: string;
  violation_types: string[];
  status: string;
  priority: string;
  location: {
    country: string;
    region: string;
    coordinates: Record<string, any>;
  };
  date_occurred: string;
  date_reported: string;
  victims: string[];
  perpetrators: Array<{
    name: string;
    type: string;
  }>;
  evidence: Array<{
    type: string;
    url: string;
    description: string;
    date_captured: string;
  }>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCaseData {
  case_id: string;
  title: string;
  description: string;
  violation_types: string[];
  status: 'new';
  priority: 'medium';
  location: {
    country: string;
    region: string;
    coordinates: Record<string, any>;
  };
  date_occurred: string;
  date_reported: string;
  victims: string[];
  perpetrators: Array<{
    name: string;
    type: string;
  }>;
  evidence: Array<{
    type: string;
    url: string;
    description: string;
    date_captured: string;
  }>;
}

export interface UpdateCaseData {
  status?: string;
  priority?: string;
  description?: string;
  violation_types?: string[];
  perpetrators?: Array<{
    name: string;
    type: string;
  }>;
  evidence?: Array<{
    type: string;
    url: string;
    description: string;
    date_captured: string;
  }>;
}

export interface CasesQueryParams {
  status?: string;
  location?: string;
  violation_type?: string;
  skip?: number;
  limit?: number;
}

export const casesService = {
  getCases: async (params?: CasesQueryParams) => {
    const response = await api.get<Case[]>('/cases/', { params });
    return response.data;
  },

  getCase: async (caseId: string) => {
    const response = await api.get<Case>(`/cases/${caseId}`);
    return response.data;
  },

  createCase: async (data: CreateCaseData) => {
    const response = await api.post<Case>('/cases/', data);
    return response.data;
  },

  updateCase: async (caseId: string, data: UpdateCaseData) => {
    const response = await api.patch<Case>(`/cases/${caseId}`, data);
    return response.data;
  },

  deleteCase: async (caseId: string) => {
    const response = await api.delete(`/cases/${caseId}`);
    return response.data;
  },
}; 