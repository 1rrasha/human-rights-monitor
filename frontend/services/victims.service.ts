import api from "../config/api";

export interface Victim {
  _id: string;
  type: string;
  anonymous: boolean;
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
  files?: File[];
}

export interface UpdateVictimData {
  risk_assessment?: {
    level?: string;
    threats?: string[];
    protection_needed?: boolean;
  };
  support_services?: Array<{
    type: string;
    provider: string;
    status: string;
  }>;
  demographics?: {
    gender?: string;
    age?: number;
    ethnicity?: string;
    occupation?: string;
  };
  contact_info?: {
    email?: string;
    phone?: string;
    secure_messaging?: string;
  };
  files?: File[];
}

export interface VictimsQueryParams {
  skip?: number;
  limit?: number;
}

export const victimsService = {
  getVictimsByCase: async (caseId: string, params?: VictimsQueryParams) => {
    const response = await api.get<Victim[]>(`/victims/case/${caseId}`, { params });
    return response.data;
  },

  getVictim: async (victimId: string) => {
    const response = await api.get<Victim>(`/victims/${victimId}`);
    return response.data;
  },

  createVictim: async (data: CreateVictimData) => {
    console.log('Sending victim data:', data);
    const response = await api.post<Victim>('/victims/', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Backend response:', response.data);
    return response.data;
  },

  updateVictim: async (victimId: string, data: UpdateVictimData) => {
    console.log('Sending victim_update:', data);
    const response = await api.patch<Victim>(`/victims/${victimId}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Backend response:', response.data);
    return response.data;
  },
};