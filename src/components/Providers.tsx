'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Providers({
  children,
  initialIsLoggedIn = false,
}: {
  children: React.ReactNode;
  initialIsLoggedIn?: boolean;
}) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialIsLoggedIn={initialIsLoggedIn}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
