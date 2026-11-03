'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        duration: 2000,
        style: {
          borderRadius: '12px',
          fontSize: '0.9375rem',
          fontWeight: '500',
        },
      }}
    />
  );
}
