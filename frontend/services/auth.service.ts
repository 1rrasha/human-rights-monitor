import api from '../config/api';

// API_URL matches the base URL in api.ts, so we only append the endpoint path
const API_URL = '/auth/';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  role: string;
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

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', data.email); // API expects 'username' for email
    formData.append('password', data.password);
    formData.append('grant_type', 'password'); // Required by /login_session endpoint

    const response = await api.post(API_URL + 'login_session', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log(response.data);

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  }

  async signup(data: SignupData): Promise<UserResponse> {
    const response = await api.post(API_URL + 'signup', data);
    return response.data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get(API_URL + 'me');
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

export default new AuthService();
