import { apiClient } from './client';
import type { Match, MatchListItem } from '@/types';

export const matchApi = {
  getMatches: (teamId: number, status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') =>
    apiClient.get<MatchListItem[]>(
      `/api/v1/teams/${teamId}/matches${status ? `?status=${status}` : ''}`
    ),

  createMatch: (
    teamId: number,
    data: {
      matchType: 'SOCCER' | 'FOOTBALL';
      opponent: string;
      matchDate: string;
      homeAway: 'HOME' | 'AWAY';
      location: string;
    }
  ) => apiClient.post<Match>(`/api/v1/teams/${teamId}/matches`, data),

  getMatch: (matchId: number) =>
    apiClient.get<Match>(`/api/v1/matches/${matchId}`),

  updateMatch: (
    matchId: number,
    data: {
      opponent?: string;
      matchDate?: string;
      location?: string;
      homeAway?: 'HOME' | 'AWAY';
      matchType?: 'SOCCER' | 'FOOTBALL';
      scoreHome?: number;
      scoreAway?: number;
      isFinished?: boolean;
    }
  ) => apiClient.patch<Match>(`/api/v1/matches/${matchId}`, data),

  deleteMatch: (matchId: number) =>
    apiClient.delete(`/api/v1/matches/${matchId}`),
};
