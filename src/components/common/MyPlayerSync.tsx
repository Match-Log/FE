'use client';

import { useSyncMyPlayer } from '@/hooks/useSyncMyPlayer';

// (main) 화면에 바로 들어온 경우(새로고침, 북마크, 로그인 페이지 자동 이동 등)에도
// 팀 선택 화면을 거치지 않고 playerId를 서버 값으로 맞춘다. 화면에는 아무것도 그리지 않는다.
export default function MyPlayerSync() {
  useSyncMyPlayer();
  return null;
}
