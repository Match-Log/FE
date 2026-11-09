import { apiClient } from './client';
import type { Career, Player, Position, PreferredFoot } from '@/types';

export const playerApi = {
  registerPlayer: (data: {
    birthDate?: string;
    height?: number;
    weight?: number;
    preferredFoot?: PreferredFoot;
    career?: Career;
    preferredPosition?: Position;
    subPosition?: Position;
  }) => apiClient.post<Player>('/api/v1/players', data),

  // 로그인한 사용자의 선수 정보. 미등록이면 404 (PLAYER_NOT_FOUND)
  getMyPlayer: () => apiClient.get<Player>('/api/v1/players/me'),

  getPlayer: (playerId: number) =>
    apiClient.get<Player>(`/api/v1/players/${playerId}`),
};
