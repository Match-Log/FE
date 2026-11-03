'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CircleCheck, CircleX, Camera } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/api/auth';
import { signupSchema, type SignupFormData } from '@/schemas/auth';
import GridBackground from '@/components/common/GridBackground';

type EmailStatus = 'idle' | 'checking' | 'available' | 'taken';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  const emailValue = watch('email');

  useEffect(() => {
    if (!emailValue || errors.email) {
      setEmailStatus('idle');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailStatus('idle');
      return;
    }

    setEmailStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await authApi.checkEmail(emailValue);
        setEmailStatus(res.data.available ? 'available' : 'taken');
      } catch {
        setEmailStatus('idle');
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [emailValue, errors.email]);

  const onSubmit = async (data: SignupFormData) => {
    if (emailStatus === 'taken') {
      toast.error('이미 사용 중인 이메일입니다');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.signup({ email: data.email, password: data.password, name: data.name });
      toast.success('회원가입이 완료되었습니다!');
      router.push('/login');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col max-w-md mx-auto relative">
      <GridBackground />

      {/* Header */}
      <header className="px-6 py-6 flex items-center gap-4 relative z-10">
        <Link
          href="/login"
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">회원가입</h1>
      </header>

      <main className="flex-grow px-8 pb-12 relative z-10">
        {/* Title */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-[3px] bg-[#00F5FF] rounded-full" />
            <p className="text-[11px] font-black text-[#00F5FF] uppercase tracking-widest">
              Base Identity
            </p>
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase leading-[0.95] mb-4">
            Create
            <br />
            <span className="accent-gradient-text">Account</span>
          </h2>
          <p className="text-zinc-600 text-[11px] font-bold">
            MATCHLOG에서 사용할 기본 정보를 입력해주세요.
          </p>
        </div>

        {/* Profile Photo (UI only) */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center cursor-pointer group hover:border-[#00F5FF]/50 transition-all">
            <Camera className="w-6 h-6 text-zinc-600 group-hover:text-[#00F5FF] transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-zinc-400">프로필 사진 (선택)</p>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold">
              JPG, PNG · MAX 5MB
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Name */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
              Name
            </label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              {...register('name')}
              className="w-full px-6 py-4 rounded-2xl text-sm font-medium bg-white/[0.03] border border-white/[0.08] placeholder-zinc-700 text-white focus:outline-none focus:border-[#00F5FF]/50 focus:bg-[#00F5FF]/[0.05] transition-all"
            />
            {errors.name && (
              <p className="text-xs text-red-400 ml-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
              Email
            </label>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              {...register('email')}
              className="w-full px-6 py-4 rounded-2xl text-sm font-medium bg-white/[0.03] border border-white/[0.08] placeholder-zinc-700 text-white focus:outline-none focus:border-[#00F5FF]/50 focus:bg-[#00F5FF]/[0.05] transition-all"
            />
            {errors.email && (
              <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>
            )}
            {emailStatus === 'available' && (
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#00F5FF] ml-1">
                <CircleCheck className="w-3 h-3" /> 사용 가능한 이메일이에요
              </p>
            )}
            {emailStatus === 'taken' && (
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 ml-1">
                <CircleX className="w-3 h-3" /> 이미 사용 중인 이메일이에요
              </p>
            )}
            {emailStatus === 'checking' && (
              <p className="text-[10px] font-bold text-zinc-500 ml-1">확인 중...</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요 (8자 이상, 영문+숫자)"
              {...register('password')}
              className="w-full px-6 py-4 rounded-2xl text-sm font-medium bg-white/[0.03] border border-white/[0.08] placeholder-zinc-700 text-white focus:outline-none focus:border-[#00F5FF]/50 focus:bg-[#00F5FF]/[0.05] transition-all"
            />
            {errors.password && (
              <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              {...register('confirmPassword')}
              className="w-full px-6 py-4 rounded-2xl text-sm font-medium bg-white/[0.03] border border-white/[0.08] placeholder-zinc-700 text-white focus:outline-none focus:border-[#00F5FF]/50 focus:bg-[#00F5FF]/[0.05] transition-all"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 ml-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-8 space-y-6">
            <button
              type="submit"
              disabled={isLoading || emailStatus === 'taken'}
              className="w-full py-5 rounded-[22px] text-sm font-black uppercase tracking-[0.2em] text-black accent-gradient shadow-[0_10px_30px_rgba(0,245,255,0.2)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '처리 중...' : '회원가입 완료'}
            </button>
            <div className="text-center">
              <p className="text-[11px] font-bold text-zinc-500">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="text-[#00F5FF] hover:underline ml-1">
                  로그인
                </Link>
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
