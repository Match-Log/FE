import { apiClient } from './client';
import type { MatchStatList, PlayerStat } from '@/types';

export const statApi = {
  getMatchStats: (matchId: number) =>
    apiClient.get<MatchStatList>(`/api/v1/matches/${matchId}/stats`),

  getPlayerStat: (matchId: number, playerId: number) =>
    apiClient.get<PlayerStat>(`/api/v1/matches/${matchId}/stats/players/${playerId}`),

  updatePlayerStat: (
    matchId: number,
    playerId: number,
    data: { goals?: number; assists?: number; saves?: number }
  ) => apiClient.put<PlayerStat>(`/api/v1/matches/${matchId}/stats/players/${playerId}`, data),
};
