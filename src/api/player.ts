import { apiClient } from './client';
import type { Player } from '@/types';

export const playerApi = {
  registerPlayer: (data: {
    name: string;
    number: number;
    mainPosition: 'GK' | 'DF' | 'MF' | 'FW';
    subPositions: ('GK' | 'DF' | 'MF' | 'FW')[];
  }) => apiClient.post<Player>('/api/v1/players', data),

  getPlayer: (playerId: number) =>
    apiClient.get<Player>(`/api/v1/players/${playerId}`),
};
