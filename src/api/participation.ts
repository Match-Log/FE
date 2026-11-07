import { apiClient } from './client';
import type { RosterItem, KickerAssignment, Position } from '@/types';

export const participationApi = {
  getTeamPlayers: (teamId: number) =>
    apiClient.get<RosterItem[]>(`/api/v1/teams/${teamId}/players`),

  deletePlayer: (teamId: number, playerId: number) =>
    apiClient.delete(`/api/v1/teams/${teamId}/players/${playerId}`),

  setKicker: (teamId: number, playerId: number, data: KickerAssignment) =>
    apiClient.put<KickerAssignment>(`/api/v1/teams/${teamId}/players/${playerId}/kicker`, data),

  getKicker: (teamId: number, playerId: number) =>
    apiClient.get<KickerAssignment>(`/api/v1/teams/${teamId}/players/${playerId}/kicker`),

  updatePlayer: (
    teamId: number,
    playerId: number,
    data: {
      role?: 'MANAGER' | 'PLAYER';
      number?: number;
      mainPosition?: Position;
      subPosition?: Position;
    }
  ) => apiClient.patch(`/api/v1/teams/${teamId}/players/${playerId}`, data),
};
