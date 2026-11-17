import { apiClient } from './client';
import type { Match, MatchListItem, MatchPlaceFields } from '@/types';

export const matchApi = {
  // status: BE는 upcoming(isFinished=false) / finished(isFinished=true)만 인식하고, 생략하면 전체를 준다.
  // 날짜 기준이 아니라 종료 처리 여부 기준이므로 화면 분류는 lib/match.ts의 getMatchStatus를 쓴다.
  getMatches: (teamId: number, status?: 'upcoming' | 'finished') =>
    apiClient.get<MatchListItem[]>(
      `/api/v1/teams/${teamId}/matches${status ? `?status=${status}` : ''}`
    ),

  createMatch: (
    teamId: number,
    data: {
      matchType: 'SOCCER' | 'FOOTBALL';
      opponent: string;
      matchDate: string;
      homeAway: 'HOME' | 'AWAY';
      location: string;
      memo?: string;
    } & MatchPlaceFields
  ) => apiClient.post<Match>(`/api/v1/teams/${teamId}/matches`, data),

  getMatch: (matchId: number) =>
    apiClient.get<Match>(`/api/v1/matches/${matchId}`),

  updateMatch: (
    matchId: number,
    data: {
      opponent?: string;
      matchDate?: string;
      location?: string;
      memo?: string;
      homeAway?: 'HOME' | 'AWAY';
      matchType?: 'SOCCER' | 'FOOTBALL';
      scoreHome?: number;
      scoreAway?: number;
      isFinished?: boolean;
    } & MatchPlaceFields
  ) => apiClient.patch<Match>(`/api/v1/matches/${matchId}`, data),

  deleteMatch: (matchId: number) =>
    apiClient.delete(`/api/v1/matches/${matchId}`),
};
