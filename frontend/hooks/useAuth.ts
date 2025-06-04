import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import authService,{ LoginData, SignupData } from '../services/auth.service';

export const useAuth = () => {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginData) => authService.login(credentials),
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.detail || 'Login failed');
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupData) => authService.signup(data),
    onSuccess: () => {
      router.push('/login');
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.detail || 'Signup failed');
    },
  });

  const logout = () => {
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
