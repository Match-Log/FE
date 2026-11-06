import axios from 'axios';

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
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(
          `${API_BASE}/api/v1/auth/reissue`,
          { refreshToken }
        );
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=1800; SameSite=Lax`;
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
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
