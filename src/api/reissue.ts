import axios from 'axios';
import { setAccessToken } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// 재발급 요청을 한 번에 하나만 보내기 위한 single-flight 가드.
// axios 인터셉터와 SSE onopen(401)이 동시에 재발급을 트리거해도 요청은 1회만 나간다.
let inflight: Promise<string> | null = null;

/**
 * refreshToken으로 accessToken을 재발급받아 저장하고 새 accessToken을 반환한다.
 * - axios 응답 인터셉터(401)와 SSE 재연결 로직이 공용으로 사용한다.
 * - apiClient가 아닌 순수 axios를 쓰는 이유: 재발급 요청 자체가 다시 401 인터셉터를 타는 재귀를 막기 위함.
 * - refreshToken이 없거나 재발급이 실패하면 reject한다(호출부에서 로그아웃/리다이렉트 처리).
 */
export function reissueToken(): Promise<string> {
  if (inflight) return inflight;

  inflight = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

    const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${API_BASE}/api/v1/auth/reissue`,
      { refreshToken }
    );

    setAccessToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  })();

  // 성공/실패와 무관하게 다음 재발급을 다시 보낼 수 있도록 가드를 해제한다.
  inflight.finally(() => {
    inflight = null;
  });

  return inflight;
}
