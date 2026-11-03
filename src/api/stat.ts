import { apiClient } from './client';
import type { PlayerStat } from '@/types';

export const statApi = {
  getMatchStats: (matchId: number) =>
    apiClient.get<PlayerStat[]>(`/api/v1/matches/${matchId}/stats`),

  getPlayerStat: (matchId: number, playerId: number) =>
    apiClient.get<PlayerStat>(`/api/v1/matches/${matchId}/stats/players/${playerId}`),

  updatePlayerStat: (matchId: number, playerId: number, data: Partial<PlayerStat>) =>
    apiClient.put<PlayerStat>(`/api/v1/matches/${matchId}/stats/players/${playerId}`, data),
};
