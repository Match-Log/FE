import { create } from 'zustand';
import { setAccessToken, removeAccessToken } from '@/lib/auth';

function getUserIdFromToken(token?: string | null): string | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonStr = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const decoded = JSON.parse(jsonStr);
    let sub = decoded?.sub ?? decoded?.userId ?? decoded?.id ?? decoded?.memberId;
    if (!sub) return null;
    sub = String(sub);
    return sub.startsWith('usr_') ? sub : `usr_${sub}`;
  } catch {
    return null;
  }
}

interface AuthState {
  isLoggedIn: boolean | null;
  myUserId: string | null;
  login: (token: string) => void;
  logout: () => void;
  setFromToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: null,
  myUserId: null,

  login: (token) => {
    setAccessToken(token);
    const uid = getUserIdFromToken(token);
    if (uid) localStorage.setItem('userId', uid);
    else localStorage.removeItem('userId');
    set({ isLoggedIn: true, myUserId: uid });
  },

  logout: () => {
    removeAccessToken();
    localStorage.removeItem('userId');
    set({ isLoggedIn: false, myUserId: null });
  },

  setFromToken: (token) => {
    setAccessToken(token);
    const uid = getUserIdFromToken(token);
    if (uid) localStorage.setItem('userId', uid);
    else localStorage.removeItem('userId');
    set({ isLoggedIn: true, myUserId: uid });
  },

  clearAuth: () => {
    removeAccessToken();
    localStorage.removeItem('userId');
    set({ isLoggedIn: false, myUserId: null });
  },
}));
