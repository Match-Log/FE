'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Target } from 'lucide-react';
import { participationApi } from '@/api/participation';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { cn } from '@/lib/utils';
import type { TeamPlayer } from '@/types';

type PositionFilter = 'ALL' | 'GK' | 'DF' | 'MF' | 'FW';
const POSITION_FILTERS: PositionFilter[] = ['ALL', 'GK', 'DF', 'MF', 'FW'];
const POSITION_LABELS: Record<string, string> = { GK: 'Goalkeeper', DF: 'Defender', MF: 'Midfielder', FW: 'Forward' };

function getInitials(name: string) {
  return name.slice(0, 2);
}

export default function SquadPage() {
  const { teamId, teamName } = useTeamStore();
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [filter, setFilter] = useState<PositionFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    participationApi.getTeamPlayers(teamId)
      .then((r) => setPlayers(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [teamId]);

  const captain = players.find((p) => p.kickerRole === 'CAPTAIN');
  const pkKicker = players.find((p) => p.kickerRole === 'PENALTY');

  const filtered = filter === 'ALL' ? players : players.filter((p) => p.mainPosition === filter);

  const counts = {
    GK: players.filter((p) => p.mainPosition === 'GK').length,
    DF: players.filter((p) => p.mainPosition === 'DF').length,
    MF: players.filter((p) => p.mainPosition === 'MF').length,
    FW: players.filter((p) => p.mainPosition === 'FW').length,
  };

  const grouped = (['GK', 'DF', 'MF', 'FW'] as const).reduce((acc, pos) => {
    const group = filtered.filter((p) => p.mainPosition === pos);
    if (group.length > 0) acc[pos] = group;
    return acc;
  }, {} as Record<string, TeamPlayer[]>);

  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-[#05060B]/80 backdrop-blur-md z-40">
        <div />
        <div className="text-center">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Squad List</p>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase accent-gradient-text">
            {teamName ?? 'My Team'}
          </h1>
        </div>
        <div className="w-10" />
      </header>

      <main className="px-6 pb-28 relative space-y-8">
        <GridBackground />

        {/* Summary card */}
        <section
          className="rounded-[2rem] p-6 border border-white/10 relative overflow-hidden z-10"
          style={{ background: 'rgba(18, 20, 32, 0.4)', backdropFilter: 'blur(20px)' }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00F5FF]/5 blur-3xl rounded-full" />
          <div className="relative z-10 flex items-center justify-between px-2">
            <div className="text-center">
              <p className="text-2xl font-black italic text-[#00F5FF] mb-0.5">{players.length}</p>
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Total</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            {(['GK', 'DF', 'MF', 'FW'] as const).map((pos) => (
              <div key={pos} className="text-center">
                <p className="text-xl font-black italic text-zinc-200 mb-0.5">{counts[pos]}</p>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{pos}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Specialists */}
        {(captain || pkKicker) && (
          <section className="space-y-4 relative z-10">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00F5FF]">Specialists</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {captain && (
                <div
                  className="shrink-0 px-5 py-4 rounded-2xl border border-white/10 flex items-center gap-4 cursor-pointer hover:border-[#00F5FF]/30 transition-all"
                  style={{ background: 'rgba(18, 20, 32, 0.4)', backdropFilter: 'blur(20px)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="pr-2">
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter mb-0.5">Captain</p>
                    <p className="text-sm font-black uppercase">{captain.name}</p>
                  </div>
                </div>
              )}
              {pkKicker && (
                <div
                  className="shrink-0 px-5 py-4 rounded-2xl border border-white/10 flex items-center gap-4 cursor-pointer hover:border-[#00F5FF]/30 transition-all"
                  style={{ background: 'rgba(18, 20, 32, 0.4)', backdropFilter: 'blur(20px)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="pr-2">
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter mb-0.5">Penalty</p>
                    <p className="text-sm font-black uppercase">{pkKicker.name}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Position filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar relative z-10">
          {POSITION_FILTERS.map((pos) => (
            <button
              key={pos}
              onClick={() => setFilter(pos)}
              className={cn(
                'px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-all',
                filter === pos
                  ? 'accent-gradient text-black shadow-[0_0_20px_rgba(0,245,255,0.3)]'
                  : 'bg-[#111218] border border-white/5 text-zinc-500'
              )}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Player list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-10 relative z-10">
            {Object.entries(grouped).map(([pos, group]) => (
              <div key={pos} className="space-y-5">
                <span className="inline-block bg-[#111218] px-3 py-1 rounded-md text-[10px] font-black text-zinc-600 uppercase tracking-[0.15em]">
                  {POSITION_LABELS[pos]}
                </span>
                <div className="space-y-5">
                  {group.map((player) => (
                    <Link key={player.playerId} href={`/squad/${player.playerId}`}>
                      <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center text-[13px] font-black uppercase tracking-tighter border border-[#00F5FF]/15 shadow-[inset_0_0_10px_rgba(0,245,255,0.05)] text-[#00F5FF]"
                            style={{ background: 'linear-gradient(135deg, #1A1B23 0%, #08090E 100%)' }}>
                            {getInitials(player.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black uppercase tracking-tight group-hover:text-[#00F5FF] transition-colors">
                                {player.name}
                              </h3>
                              {player.role === 'MANAGER' && (
                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 uppercase">
                                  MGR
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                              #{player.number} · {player.mainPosition}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-zinc-800 uppercase tracking-widest italic">
                          {player.mainPosition}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#00F5FF]/20 to-transparent" />
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-zinc-700 text-xs font-bold uppercase tracking-widest py-10">
                선수가 없습니다
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
