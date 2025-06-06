import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import authService, { LoginData, SignupData } from '../services/auth.service';

export const useAuth = () => {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginData) => {
      console.log('[useAuth] Initiating login with credentials:', credentials.email);
      return authService.login(credentials);
    },
    onSuccess: (data) => {
      console.log('[useAuth] Login successful, received token:', data.access_token);
    },
    onError: (error: any) => {
      console.error('[useAuth] Login failed:', error.message, error.response?.data);
      return Promise.reject(error);
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupData) => {

      return authService.signup(data);
    },
    onSuccess: () => {

      // router.push('/login');
    },
    onError: (error: any) => {
      console.error('[useAuth] Signup failed:', error.message, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Signup failed');
    },
  });

  const logout = () => {
    console.log('[useAuth] Logging out');
    authService.logout();
    router.push('/login');
  };

  return {
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout,
    isLoading: loginMutation.isPending || signupMutation.isPending,
    error: loginMutation.error || signupMutation.error,
  };
};