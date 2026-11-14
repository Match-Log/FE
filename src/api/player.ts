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

  // 본인만 수정 가능. BE는 null(생략) 필드를 무시하고 기존 값을 유지한다 → 값을 '지우는' 건 불가.
  updatePlayer: (
    playerId: number,
    data: {
      birthDate?: string;
      height?: number;
      weight?: number;
      preferredFoot?: PreferredFoot;
      career?: Career;
      yearsOfExperience?: number;
      preferredPosition?: Position;
      subPosition?: Position;
    }
  ) => apiClient.patch<Player>(`/api/v1/players/${playerId}`, data),

  getPlayer: (playerId: number) =>
    apiClient.get<Player>(`/api/v1/players/${playerId}`),
};
