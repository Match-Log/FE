import { apiClient } from './client';
import { Vote } from '@/types';

export const voteApi = {
  getVotes: (matchId: number, status?: 'ATTEND' | 'ABSENT' | 'PENDING') =>
    apiClient.get<Vote[]>(
      `/api/v1/matches/${matchId}/votes${status ? `?status=${status}` : ''}`
    ),

  vote: (matchId: number, data: { status: 'ATTEND' | 'ABSENT' | 'PENDING' }) =>
    apiClient.put(`/api/v1/matches/${matchId}/votes`, data),
};
