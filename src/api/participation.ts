import { apiClient } from './client';
import type { TeamPlayer, KickerRole } from '@/types';

export const participationApi = {
  getTeamPlayers: (teamId: number) =>
    apiClient.get<TeamPlayer[]>(`/api/v1/teams/${teamId}/players`),

  deletePlayer: (teamId: number, playerId: number) =>
    apiClient.delete(`/api/v1/teams/${teamId}/players/${playerId}`),

  setKicker: (teamId: number, playerId: number, data: { role: KickerRole }) =>
    apiClient.put(`/api/v1/teams/${teamId}/players/${playerId}/kicker`, data),

  getKicker: (teamId: number, playerId: number) =>
    apiClient.get<{ role: KickerRole }>(`/api/v1/teams/${teamId}/players/${playerId}/kicker`),

  updatePlayer: (teamId: number, playerId: number, data: Partial<TeamPlayer>) =>
    apiClient.patch<TeamPlayer>(`/api/v1/teams/${teamId}/players/${playerId}`, data),
};
