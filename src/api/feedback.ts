import { apiClient } from './client';
import type { Feedback, SavePersonalFeedbackRequest } from '@/types';

// 피드백은 종료된 경기에서만 조회·저장 가능. 저장은 MANAGER만.
export const feedbackApi = {
  // 없으면 404(FEEDBACK_NOT_FOUND)
  getTeamFeedback: (matchId: number) =>
    apiClient.get<Feedback>(`/api/v1/matches/${matchId}/feedbacks?scope=team`),

  saveTeamFeedback: (matchId: number, content: string) =>
    apiClient.put<Feedback>(`/api/v1/matches/${matchId}/feedbacks?scope=team`, { content }),

  // MANAGER 전용
  getAllPersonalFeedbacks: (matchId: number) =>
    apiClient.get<Feedback[]>(`/api/v1/matches/${matchId}/feedbacks/players`),

  // 본인 또는 MANAGER. 본인이라도 비공개(isVisible=false)면 404
  getFeedback: (matchId: number, playerId: number) =>
    apiClient.get<Feedback>(`/api/v1/matches/${matchId}/feedbacks/players/${playerId}`),

  // 참석(ATTEND) 투표한 선수에게만 저장 가능
  savePersonalFeedback: (matchId: number, playerId: number, data: SavePersonalFeedbackRequest) =>
    apiClient.put<Feedback>(`/api/v1/matches/${matchId}/feedbacks/players/${playerId}`, data),
};
