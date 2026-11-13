'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      theme="dark"
      offset={16}
      toastOptions={{
        duration: 2500,
        style: {
          background: 'rgba(10, 11, 20, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          color: '#ffffff',
          fontSize: '0.9375rem',
          fontWeight: '600',
          padding: '14px 16px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          maxWidth: '360px',
          margin: '0 auto',
        },
        classNames: {
          error: 'ml-toast-error',
          success: 'ml-toast-success',
        },
      }}
    />
  );
}
