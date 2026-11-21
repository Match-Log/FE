'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { mvpVoteApi } from '@/api/mvpVote';
import { statApi } from '@/api/stat';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn, getNameInitials, getErrorMessage } from '@/lib/utils';
import type { MvpVoteResponse, PlayerStatItem } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: number;
}

/** 경기 돌아보기 (읽기 전용): 최다득표 MVP + 출전 선수 스탯. */
export default function MatchReviewDialog({ open, onOpenChange, matchId }: Props) {
  const [mvp, setMvp] = useState<MvpVoteResponse | null>(null);
  const [stats, setStats] = useState<PlayerStatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    Promise.all([mvpVoteApi.getMvpVotes(matchId), statApi.getMatchStats(matchId)])
      .then(([m, s]) => {
        setMvp(m.data);
        setStats(s.data.stats ?? []);
      })
      .catch((err) => toast.error(getErrorMessage(err, '경기 정보를 불러오지 못했습니다')))
      .finally(() => setIsLoading(false));
  }, [open, matchId]);

  const winners =
    mvp?.winners
      .map((pid) => mvp.results.find((r) => r.playerId === pid))
      .filter((r): r is NonNullable<typeof r> => !!r) ?? [];
  const topVotes = winners[0]?.voteCount ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#05060B] border border-white/10 text-white max-w-md mx-auto overflow-hidden p-0 gap-0">
        <div className="absolute inset-x-0 top-0 h-[2px] accent-gradient z-20" />
        <DialogHeader className="px-5 pt-6 pb-4 border-b border-white/5">
          <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#00F5FF]" />
            경기 돌아보기
          </DialogTitle>
          <DialogDescription className="text-[11px] font-bold text-zinc-500">
            MVP 투표 결과와 선수 스탯
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[78vh] overflow-y-auto px-4 py-4 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* MVP */}
              <section className="rounded-2xl border border-[#00F5FF]/20 bg-[#00F5FF]/[0.04] p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Trophy className="w-3.5 h-3.5 text-[#00F5FF]" />
                  <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-widest">MVP</span>
                  {winners.length > 0 && (
                    <span className="text-[10px] font-bold text-zinc-500">· {topVotes}표</span>
                  )}
                </div>
                {winners.length === 0 ? (
                  <p className="text-[11px] font-bold text-zinc-500 py-1">아직 득표가 없습니다</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {winners.map((w) => (
                      <div
                        key={w.playerId}
                        className="flex items-center gap-2 bg-[#00F5FF]/10 border border-[#00F5FF]/25 rounded-xl px-3 py-2"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#00F5FF]/20 flex items-center justify-center text-[9px] font-black text-[#00F5FF]">
                          {getNameInitials(w.name)}
                        </div>
                        <span className="text-sm font-black text-white">{w.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 선수 스탯 */}
              <section>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">출전 선수 스탯</p>
                {stats.length === 0 ? (
                  <p className="text-[11px] font-bold text-zinc-500 py-2">입력된 스탯이 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {/* 헤더 */}
                    <div className="flex items-center gap-2 px-3 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                      <span className="flex-1">선수</span>
                      <span className="w-8 text-center">골</span>
                      <span className="w-8 text-center">도움</span>
                      <span className="w-10 text-center">선방</span>
                    </div>
                    {stats.map((s) => (
                      <div
                        key={s.playerId ?? s.name}
                        className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-black text-zinc-400 flex-shrink-0">
                            {getNameInitials(s.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate">{s.name ?? '-'}</p>
                            {s.position && (
                              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{s.position}</p>
                            )}
                          </div>
                        </div>
                        <span className="w-8 text-center text-sm font-black tabular-nums text-white">{s.goals ?? 0}</span>
                        <span className="w-8 text-center text-sm font-black tabular-nums text-white">{s.assists ?? 0}</span>
                        <span
                          className={cn(
                            'w-10 text-center text-sm font-black tabular-nums',
                            s.saves == null ? 'text-zinc-700' : 'text-white'
                          )}
                        >
                          {s.saves == null ? '-' : s.saves}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
