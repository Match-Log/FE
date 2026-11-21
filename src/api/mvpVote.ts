import { apiClient } from './client';
import type { MvpVoteResponse } from '@/types';

export const mvpVoteApi = {
  getMvpVotes: (matchId: number) =>
    apiClient.get<MvpVoteResponse>(`/api/v1/matches/${matchId}/mvp-votes`),

  // upsert. 응답은 저장 직후 전체 재집계 결과(getMvpVotes와 동일 구조).
  voteMvp: (matchId: number, data: { votedPlayerId: number }) =>
    apiClient.put<MvpVoteResponse>(`/api/v1/matches/${matchId}/mvp-votes`, data),
};
