import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TeamStore {
  teamId: number | null;
  teamName: string | null;
  playerId: number | null;
  role: 'MANAGER' | 'PLAYER' | null;
  setTeam: (teamId: number, playerId: number | null, role: string, teamName?: string) => void;
  setPlayerId: (playerId: number | null) => void;
  clear: () => void;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      teamId: null,
      teamName: null,
      playerId: null,
      role: null,
      setTeam: (teamId, playerId, role, teamName) =>
        set({
          teamId,
          playerId,
          role: role as 'MANAGER' | 'PLAYER',
          teamName: teamName ?? null,
        }),
      setPlayerId: (playerId) => set({ playerId }),
      clear: () => set({ teamId: null, teamName: null, playerId: null, role: null }),
    }),
    { name: 'team-store' }
  )
);
