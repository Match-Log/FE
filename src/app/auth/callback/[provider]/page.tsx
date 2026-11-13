'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { BarChart2 } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { useTeamStore } from '@/stores/teamStore';
import { persistAuthSession } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/apiError';
import type { OAuthProvider } from '@/lib/oauth';

const VALID_PROVIDERS: OAuthProvider[] = ['google', 'kakao'];

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const clearTeam = useTeamStore((s) => s.clear);
  // StrictMode(개발) 이중 실행 등으로 code가 두 번 교환되는 것을 막는다.
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const provider = String(params.provider) as OAuthProvider;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    const fail = (message: string) => {
      console.error('[OAuth Callback] 실패:', message);
      toast.error(message);
      router.replace('/login');
    };

    if (error) return fail('소셜 로그인이 취소되었습니다');
    if (!VALID_PROVIDERS.includes(provider)) return fail('지원하지 않는 로그인 방식입니다');
    if (!code) return fail('인증 코드를 받지 못했습니다');

    (async () => {
      try {
        const res = await authApi.oauthLogin(provider, code);
        console.log('[OAuth Callback] 성공:', res.data);

        persistAuthSession(res.data);
        login(res.data.accessToken);
        // 이전 계정의 팀/선수 정보 초기화. 선수 정보는 팀 선택 화면에서 서버 기준으로 다시 채운다.
        clearTeam();
        router.replace('/team/select');
      } catch (err: unknown) {
        fail(getApiErrorMessage(err, '소셜 로그인에 실패했습니다'));
      }
    })();
  }, [params, searchParams, router, login, clearTeam]);

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col items-center justify-center gap-6">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,245,255,0.3)] animate-pulse">
        <BarChart2 className="w-6 h-6 text-[#00F5FF]" />
      </div>
      <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase">
        Signing you in...
      </p>
    </div>
  );
}
