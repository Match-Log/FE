import { apiClient } from './client';
import type { Feedback } from '@/types';

export const feedbackApi = {
  getFeedback: (matchId: number, playerId: number) =>
    apiClient.get<Feedback>(`/api/v1/matches/${matchId}/feedbacks/players/${playerId}`),

  updateFeedback: (matchId: number, playerId: number, data: { content: string; rating?: number }) =>
    apiClient.put<Feedback>(`/api/v1/matches/${matchId}/feedbacks/players/${playerId}`, data),
};
