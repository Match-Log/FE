import { apiClient } from './client';
import type { Team, TeamDetail } from '@/types';

export const teamApi = {
  getTeams: () =>
    apiClient.get<Team[]>('/api/v1/teams'),

  getTeam: (teamId: number) =>
    apiClient.get<TeamDetail>(`/api/v1/teams/${teamId}`),

  createTeam: (data: { name: string; region: string; matchType: 'SOCCER' | 'FUTSAL' }) =>
    apiClient.post<Team>('/api/v1/teams', data),

  joinTeam: (data: { inviteCode: string }) =>
    apiClient.post<Team>('/api/v1/teams/join', data),

  getInviteCode: (teamId: number) =>
    apiClient.get<{ inviteCode: string }>(`/api/v1/teams/${teamId}/invite-code`),

  updateTeam: (teamId: number, data: { name?: string; region?: string }) =>
    apiClient.patch<TeamDetail>(`/api/v1/teams/${teamId}`, data),

  deleteTeam: (teamId: number) =>
    apiClient.delete(`/api/v1/teams/${teamId}`),
};
