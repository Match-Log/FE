import axios from 'axios';
import { reissueToken } from './reissue';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  console.log(`[API REQ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => {
    console.log(`[API RES] ${res.status} ${res.config.url}`, res.data);
    return res;
  },
  async (error) => {
    console.error(`[API ERR] ${error.response?.status} ${error.config?.url}`, error.response?.data, error.message);
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const accessToken = await reissueToken();
        orig.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(orig);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        document.cookie = 'accessToken=; path=/; max-age=0';
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
