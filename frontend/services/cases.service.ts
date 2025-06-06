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
  created_by_user: {
    user_id: string;
    full_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateCaseData {
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
  files?: File[];
}

export interface UpdateCaseData {
  status?: string;
  priority?: string;
  description?: string;
  violation_types?: string[];
  perpetrators?: Array<{ name: string; type: string }>;
  evidence?: Array<{
    type: string;
    url: string;
    description: string;
    date_captured: string;
  }>;
  files?: File[];
  title?: string;
  victims?: string[];
  location?: {
    country: string;
    region: string;
    coordinates: Record<string, any>;
  };
  date_occurred?: string;
  date_reported?: string;
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
    const formData = new FormData();
    // Stringify the case data
    formData.append('case', JSON.stringify({ ...data, files: undefined }));
    // Append files if provided
    if (data.files) {
      data.files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
    }
    const response = await api.post<Case>('/cases/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateCase: async (caseId: string, data: UpdateCaseData) => {
    const formData = new FormData();
    const caseUpdateJson = JSON.stringify({ ...data, files: undefined });
    console.log("Sending case_update:", caseUpdateJson); // Debug log
    formData.append('case_update', caseUpdateJson);
    if (data.files) {
      data.files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
        console.log(`Appending file[${index}]:`, file.name); // Debug log
      });
    }
    const response = await api.patch<Case>(`/cases/${caseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log("Backend response:", response.data); // Debug log
    return response.data;
  },

  deleteCase: async (caseId: string) => {
    const response = await api.delete<string>(`/cases/${caseId}`);
    return response.data;
  },
};