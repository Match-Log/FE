import { apiClient } from './client';
import type { Lineup, LineupSpotRequest } from '@/types';

export const lineupApi = {
  getLineup: (matchId: number) =>
    apiClient.get<Lineup[]>(`/api/v1/matches/${matchId}/lineup`),

  saveLineup: (
    matchId: number,
    data: { quarter: number; formation: string; spots: LineupSpotRequest[] }
  ) => apiClient.put<Lineup>(`/api/v1/matches/${matchId}/lineup`, data),
};
