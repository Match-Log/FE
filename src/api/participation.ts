import { apiClient } from './client';
import type { RosterItem, Position, RoleAssignment, UpdateRoleAssignmentRequest } from '@/types';

export const participationApi = {
  getTeamPlayers: (teamId: number) =>
    apiClient.get<RosterItem[]>(`/api/v1/teams/${teamId}/players`),

  deletePlayer: (teamId: number, playerId: number) =>
    apiClient.delete(`/api/v1/teams/${teamId}/players/${playerId}`),

  getRoleAssignment: (teamId: number) =>
    apiClient.get<RoleAssignment>(`/api/v1/teams/${teamId}/role-assignment`),

  // 매니저만 가능. 6개 역할을 한 번에 덮어쓴다.
  updateRoleAssignment: (teamId: number, data: UpdateRoleAssignmentRequest) =>
    apiClient.put<RoleAssignment>(`/api/v1/teams/${teamId}/role-assignment`, data),

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
