import api from '../config/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  full_name: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  _id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const authService = {
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    console.log('[authService] Login attempt with email:', credentials.email);
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    try {
      const response = await api.post('/auth/login_session', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const authResponse: AuthResponse = response.data;
      console.log('[authService] Login successful, token:', authResponse.access_token);
      localStorage.setItem('access_token', authResponse.access_token);
      document.cookie = `auth_token=${authResponse.access_token}; path=/; Secure; SameSite=Strict`;
      console.log('[authService] Stored access_token in localStorage and auth_token in cookies');
      return authResponse;
    } catch (error: any) {
      console.error('[authService] Login failed:', error.response?.data || error.message);
      throw error;
    }
  },

  signup: async (data: SignupData): Promise<void> => {
    console.log('[authService] Signup attempt with email:', data.email);
    try {
      await api.post('/auth/signup', {
        email: data.email,
        full_name: data.full_name,
        password: data.password,
        role: data.role || 'user',
      });
      console.log('[authService] Signup successful');
    } catch (error: any) {
      console.error('[authService] Signup failed:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    console.log('[authService] Logging out, removing tokens');
    localStorage.removeItem('access_token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  },

  getCurrentUser: async (): Promise<UserResponse | null> => {
    console.log('[authService] Fetching current user');
    try {
      const response = await api.get('/auth/me');
      console.log('[authService] Current user fetched:', response.data.email);
      return response.data;
    } catch (error: any) {
      console.error('[authService] Failed to fetch current user:', error.response?.data || error.message);
      return null;
    }
  },
};

export default authService;