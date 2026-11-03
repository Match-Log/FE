'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/api/auth';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(data);
      const { accessToken, refreshToken, name } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userName', name);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=1800; SameSite=Lax`;

      login(accessToken);
      router.push('/team/select');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col max-w-md mx-auto">
      {/* Hero */}
      <div className="relative h-[35vh] w-full overflow-hidden shrink-0">
        <div className="absolute inset-0 grid-pattern" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,245,255,0.06) 0%, rgba(112,0,255,0.1) 100%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
          <div className="w-40 h-24 border-2 border-[#00F5FF] rounded-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060B] via-[#05060B]/20 to-transparent" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 pt-8">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,245,255,0.3)]">
            <BarChart2 className="w-6 h-6 text-[#00F5FF]" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase">
            Match<span className="text-[#00F5FF]">Log</span>
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <main className="relative z-20 flex-grow px-6 -mt-6 overflow-hidden">
        <div className="bg-[#0A0B14] border border-white/5 rounded-t-[3rem] p-8 pb-12 shadow-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2 uppercase">
              Welcome back
            </h2>
            <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">
              The Future of Football Data
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                Identity
              </label>
              <input
                type="email"
                placeholder="Enter Email"
                {...register('email')}
                className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 transition-all focus:outline-none focus:border-b-[#00F5FF] focus:shadow-[0_0_0_4px_rgba(0,245,255,0.15)]"
              />
              {errors.email && (
                <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                Security
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                {...register('password')}
                className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 transition-all focus:outline-none focus:border-b-[#00F5FF] focus:shadow-[0_0_0_4px_rgba(0,245,255,0.15)]"
              />
              {errors.password && (
                <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] font-black py-2">
              <label className="flex items-center cursor-pointer gap-2">
                <button
                  type="button"
                  onClick={() => setRememberMe((v) => !v)}
                  className={cn(
                    'w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all',
                    rememberMe
                      ? 'bg-[#00F5FF] border-[#00F5FF]'
                      : 'border-zinc-700'
                  )}
                >
                  {rememberMe && (
                    <span className="text-[8px] text-black font-black">✓</span>
                  )}
                </button>
                <span className="text-zinc-500 uppercase tracking-widest">Remember Me</span>
              </label>
              <a href="#" className="text-[#00F5FF] uppercase tracking-widest">
                Forgot?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full accent-gradient text-black font-black py-5 shadow-[0_10px_30px_rgba(0,245,255,0.2)] active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Login Account'}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="bg-[#0A0B14] px-4 text-zinc-600">Secure Auth</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-white text-black py-4 text-[10px] font-black uppercase tracking-widest"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-[#FAE100] text-black py-4 text-[10px] font-black uppercase tracking-widest"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.82 2 11.5c0 2.97 1.83 5.6 4.6 7.11L5.44 21.5l3.97-2.03A11.5 11.5 0 0 0 12 20c5.523 0 10-3.82 10-8.5S17.523 3 12 3z" />
              </svg>
              <span>Kakao</span>
            </button>
          </div>

          <p className="text-center mt-12 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            New Player?{' '}
            <Link href="/signup" className="text-[#00F5FF] font-black ml-1 hover:underline">
              Join League
            </Link>
          </p>
        </div>

        {/* Mini Stats */}
        <div className="mt-8 grid grid-cols-2 gap-6 text-center pb-12 px-4">
          <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5">
            <p className="text-xl font-black text-white">1.2M+</p>
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">
              Data Points
            </p>
          </div>
          <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5">
            <p className="text-xl font-black text-[#00F5FF]">850+</p>
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">
              Elite Clubs
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
