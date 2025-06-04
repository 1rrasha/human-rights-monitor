import api from '../config/api';

export interface Victim {
  _id: string;
  type: string;
  anonymous: boolean;
  pseudonym: string;
  demographics: {
    gender: string;
    age: number;
    ethnicity: string;
    occupation: string;
  };
  contact_info: {
    email: string;
    phone: string;
    secure_messaging: string;
  };
  cases_involved: string[];
  risk_assessment: {
    level: string;
    threats: string[];
    protection_needed: boolean;
  };
  support_services: Array<{
    type: string;
    provider: string;
    status: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CreateVictimData {
  type: string;
  anonymous: boolean;
  pseudonym: string;
  demographics: {
    gender: string;
    age: number;
    ethnicity: string;
    occupation: string;
  };
  contact_info: {
    email: string;
    phone: string;
    secure_messaging: string;
  };
  cases_involved: string[];
  risk_assessment: {
    level: string;
    threats: string[];
    protection_needed: boolean;
  };
  support_services: Array<{
    type: string;
    provider: string;
    status: string;
  }>;
}

export interface UpdateVictimData {
  risk_assessment?: {
    level: string;
    threats: string[];
    protection_needed: boolean;
  };
  support_services?: Array<{
    type: string;
    provider: string;
    status: string;
  }>;
  contact_info?: {
    email: string;
    phone: string;
    secure_messaging: string;
  };
  cases_involved?: string[];
}

export const victimsService = {
  createVictim: async (data: CreateVictimData) => {
    const response = await api.post<Victim>('/victims/', data);
    return response.data;
  },

  getVictim: async (victimId: string) => {
    const response = await api.get<Victim>(`/victims/${victimId}`);
    return response.data;
  },

  updateVictim: async (victimId: string, data: UpdateVictimData) => {
    const response = await api.patch<Victim>(`/victims/${victimId}`, data);
    return response.data;
  },

  getCaseVictims: async (caseId: string) => {
    const response = await api.get<Victim[]>(`/victims/case/${caseId}`);
    return response.data;
  },
}; 