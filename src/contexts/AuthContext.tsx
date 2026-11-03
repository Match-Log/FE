'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getAccessToken } from '@/lib/auth';

const InitialAuthContext = createContext<boolean>(false);

export function AuthProvider({
  children,
  initialIsLoggedIn = false,
}: {
  children: React.ReactNode;
  initialIsLoggedIn?: boolean;
}) {
  const { setFromToken, clearAuth } = useAuthStore();

  useEffect(() => {
    const token = getAccessToken();
    if (token) setFromToken(token);
    else clearAuth();
  }, []);

  return (
    <InitialAuthContext.Provider value={initialIsLoggedIn}>
      {children}
    </InitialAuthContext.Provider>
  );
}

export function useAuth() {
  const store = useAuthStore();
  const initialIsLoggedIn = useContext(InitialAuthContext);
  return {
    ...store,
    isLoggedIn: store.isLoggedIn === null ? initialIsLoggedIn : store.isLoggedIn,
  };
}
