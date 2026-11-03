import { useTeamStore } from '@/stores/teamStore';

export function useCurrentTeam() {
  return useTeamStore();
}
