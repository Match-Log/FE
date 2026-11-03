import { apiClient } from './client';
import { Match } from '@/types';

export const matchApi = {
  getMatches: (teamId: number, status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') =>
    apiClient.get<Match[]>(
      `/api/v1/teams/${teamId}/matches${status ? `?status=${status}` : ''}`
    ),

  createMatch: (
    teamId: number,
    data: {
      matchType: 'SOCCER' | 'FUTSAL';
      opponentTeam: string;
      matchDate: string;
      homeAway: 'HOME' | 'AWAY';
      location: string;
      leagueInfo?: string;
      memo?: string;
    }
  ) => apiClient.post<Match>(`/api/v1/teams/${teamId}/matches`, data),

  getMatch: (matchId: number) =>
    apiClient.get<Match>(`/api/v1/matches/${matchId}`),

  updateMatch: (matchId: number, data: Partial<Match>) =>
    apiClient.patch<Match>(`/api/v1/matches/${matchId}`, data),

  deleteMatch: (matchId: number) =>
    apiClient.delete(`/api/v1/matches/${matchId}`),
};
