'use client';

import { useEffect, useState } from 'react';
import { playerApi } from '@/api/player';
import { useTeamStore } from '@/stores/teamStore';

export type MyPlayerStatus = 'checking' | 'registered' | 'unregistered' | 'unknown';

/**
 * 선수 등록 여부와 내 playerId를 서버(GET /players/me) 기준으로 맞춘다.
 * localStorage(team-store)의 값은 재로그인·다른 브라우저·예전 버전 저장값 때문에 틀릴 수 있으므로
 * 화면에 들어올 때마다 서버 값으로 덮어쓴다.
 *
 * - 200 → playerId 저장, 'registered'
 * - 404 → playerId 비움, 'unregistered'
 * - 그 외 오류(네트워크 등) → 저장값 유지, 'unknown'
 */
export function useSyncMyPlayer(): MyPlayerStatus {
  const setPlayerId = useTeamStore((s) => s.setPlayerId);
  const [status, setStatus] = useState<MyPlayerStatus>('checking');

  useEffect(() => {
    let cancelled = false;
    playerApi
      .getMyPlayer()
      .then((res) => {
        if (cancelled) return;
        setPlayerId(res.data.playerId);
        setStatus('registered');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const httpStatus =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined;
        if (httpStatus === 404) {
          setPlayerId(null);
          setStatus('unregistered');
        } else {
          setStatus('unknown');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [setPlayerId]);

  return status;
}
