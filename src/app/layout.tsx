import Providers from '@/components/Providers';
import { Toaster } from '@/components/Toaster';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MatchLog',
  description: '축구/풋살 팀 경기 기록 서비스',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const initialIsLoggedIn = !!token;

  return (
    <html lang="ko" className={plusJakartaSans.variable}>
      <body style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', backgroundColor: '#05060B', color: '#FFFFFF' }}>
        <Providers initialIsLoggedIn={initialIsLoggedIn}>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
