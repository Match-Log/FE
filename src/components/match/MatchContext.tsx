'use client';

import { createContext, useContext } from 'react';
import type { Match } from '@/types';

/**
 * 경기 상세 레이아웃(헤더·탭)과 하위 탭 페이지가 같은 match 상태를 공유하기 위한 컨텍스트.
 * 결과 입력으로 finished가 바뀌면 탭 라벨(Tactic → Feedback)이 새로고침 없이 바로 갱신된다.
 */
interface MatchContextValue {
  match: Match | null;
  setMatch: (match: Match) => void;
}

export const MatchContext = createContext<MatchContextValue | null>(null);

export function useMatchContext() {
  return useContext(MatchContext);
}
