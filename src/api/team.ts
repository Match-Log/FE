import { apiClient } from './client';
import type { Team, TeamDetail } from '@/types';

export const teamApi = {
  getTeams: () =>
    apiClient.get<Team[]>('/api/v1/teams'),

  getTeam: (teamId: number) =>
    apiClient.get<TeamDetail>(`/api/v1/teams/${teamId}`),

  createTeam: (data: { name: string; region?: string; teamImage?: string; foundedYear?: number; homeGround?: string }) =>
    apiClient.post<TeamDetail>('/api/v1/teams', data),

  joinTeam: (data: { inviteCode: string }) =>
    apiClient.post<{ participationId: number; teamId: number; teamName: string; teamImage?: string; playerId: number; role: string; joinedAt: string }>('/api/v1/teams/join', data),

  getInviteCode: (teamId: number) =>
    apiClient.get<{ inviteCode: string }>(`/api/v1/teams/${teamId}/invite-code`),

  updateTeam: (
    teamId: number,
    data: { name?: string; region?: string; teamImage?: string; foundedYear?: number; homeGround?: string }
  ) => apiClient.patch<TeamDetail>(`/api/v1/teams/${teamId}`, data),

  deleteTeam: (teamId: number) =>
    apiClient.delete(`/api/v1/teams/${teamId}`),
};
