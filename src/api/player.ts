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

  getPlayer: (playerId: number) =>
    apiClient.get<Player>(`/api/v1/players/${playerId}`),
};
