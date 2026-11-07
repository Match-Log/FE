import { apiClient } from './client';
import type { VoteStatusResponse } from '@/types';

export const voteApi = {
  getVotes: (matchId: number) =>
    apiClient.get<VoteStatusResponse>(`/api/v1/matches/${matchId}/votes`),

  vote: (matchId: number, data: { status: 'ATTEND' | 'ABSENT' | 'PENDING' }) =>
    apiClient.put(`/api/v1/matches/${matchId}/votes`, data),
};
