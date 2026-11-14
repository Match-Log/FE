import { apiClient } from './client';
import type { Tactic, TacticFields } from '@/types';

// 전술은 경기 종료 전까지만 저장 가능(종료 후 MATCH_ALREADY_FINISHED). 저장은 MANAGER만.
export const tacticApi = {
  // 없으면 404(TACTIC_NOT_FOUND)
  getTeamTactic: (matchId: number) =>
    apiClient.get<Tactic>(`/api/v1/matches/${matchId}/tactics?scope=team`),

  saveTeamTactic: (matchId: number, data: TacticFields) =>
    apiClient.put<Tactic>(`/api/v1/matches/${matchId}/tactics?scope=team`, data),

  // 팀원 누구나 조회 가능
  getPersonalTactics: (matchId: number) =>
    apiClient.get<Tactic[]>(`/api/v1/matches/${matchId}/tactics/players`),

  // 참석(ATTEND) 투표한 선수에게만 저장 가능
  savePersonalTactic: (matchId: number, playerId: number, content: string) =>
    apiClient.put<Tactic>(`/api/v1/matches/${matchId}/tactics/players/${playerId}`, { content }),
};
