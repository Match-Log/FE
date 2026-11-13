import { apiClient } from './client';
import { LoginResponse } from '@/types';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post<LoginResponse>('/api/v1/auth/login', data),

  oauthLogin: (provider: 'google' | 'kakao', code: string) =>
    apiClient.post<LoginResponse>(`/api/v1/auth/oauth/${provider}`, { code }),

  signup: (data: { email: string; password: string; name: string }) =>
    apiClient.post('/api/v1/auth/signup', data),

  logout: () =>
    apiClient.post('/api/v1/auth/logout'),

  checkEmail: (email: string) =>
    apiClient.get<{ available: boolean }>(`/api/v1/auth/check-email?email=${encodeURIComponent(email)}`),
};
