'use client';

import { useEffect, useState } from 'react';
import { Trophy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { voteApi } from '@/api/vote';
import { mvpVoteApi } from '@/api/mvpVote';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn, getNameInitials, getErrorMessage, getErrorStatus } from '@/lib/utils';
import type { MvpVoteResponse, VoteItem } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: number;
  playerId: number | null;
}

/**
 * MVP 투표 모달. 후보는 출석투표 ATTEND 명단.
 * PUT 응답에 전체 재집계 결과가 담겨 와서 재조회 없이 상태를 교체한다.
 */
export default function MvpVoteDialog({ open, onOpenChange, matchId, playerId }: Props) {
  const [candidates, setCandidates] = useState<VoteItem[]>([]);
  const [mvp, setMvp] = useState<MvpVoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [votingId, setVotingId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    Promise.all([voteApi.getVotes(matchId), mvpVoteApi.getMvpVotes(matchId)])
      .then(([v, m]) => {
        setCandidates(v.data.votes.filter((x) => x.status === 'ATTEND'));
        setMvp(m.data);
      })
      .catch((err) => toast.error(getErrorMessage(err, '투표 정보를 불러오지 못했습니다')))
      .finally(() => setIsLoading(false));
  }, [open, matchId]);

  const voteCountOf = (pid: number) => mvp?.results.find((r) => r.playerId === pid)?.voteCount ?? 0;
  const isWinner = (pid: number) => !!mvp?.winners.includes(pid);

  // 득표수 내림차순, 동률이면 이름순
  const sorted = [...candidates].sort((a, b) => {
    const diff = voteCountOf(b.playerId) - voteCountOf(a.playerId);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });

  const handleVote = async (votedPlayerId: number) => {
    if (votingId != null) return;
    setVotingId(votedPlayerId);
    try {
      const res = await mvpVoteApi.voteMvp(matchId, { votedPlayerId });
      setMvp(res.data);
    } catch (err) {
      const status = getErrorStatus(err);
      if (status === 409) toast.error('경기가 아직 종료되지 않았습니다');
      else if (status === 403) toast.error('접근 권한이 없습니다');
      else toast.error(getErrorMessage(err, '투표에 실패했습니다'));
    } finally {
      setVotingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => votingId == null && onOpenChange(o)}>
      <DialogContent className="bg-[#0E0F18] border border-white/10 text-white max-w-sm mx-auto overflow-hidden p-0 gap-0">
        <div className="absolute inset-x-0 top-0 h-[2px] accent-gradient z-10" />
        <DialogHeader className="px-5 pt-6 pb-4 border-b border-white/5">
          <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#00F5FF]" />
            MVP 투표
          </DialogTitle>
          <DialogDescription className="text-[11px] font-bold text-zinc-500">
            {mvp ? `총 ${mvp.totalVotes}표` : '출석 선수 중 MVP를 선택하세요'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-4 py-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-center text-[11px] font-bold text-zinc-500 py-12">
              출석 확정 선수가 없어 투표할 수 없습니다
            </p>
          ) : (
            sorted.map((c) => {
              const count = voteCountOf(c.playerId);
              const selected = mvp?.myVote === c.playerId;
              const winner = isWinner(c.playerId);
              const loading = votingId === c.playerId;
              return (
                <button
                  key={c.playerId}
                  onClick={() => handleVote(c.playerId)}
                  disabled={votingId != null}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl px-3 py-3 border transition-all active:scale-[0.98] disabled:opacity-60',
                    selected
                      ? 'bg-[#00F5FF]/10 border-[#00F5FF]/40'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0',
                      selected ? 'bg-[#00F5FF]/20 text-[#00F5FF]' : 'bg-zinc-800 text-zinc-400'
                    )}
                  >
                    {getNameInitials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-white truncate">{c.name}</span>
                      {playerId === c.playerId && (
                        <span className="text-[9px] font-black text-zinc-500">(나)</span>
                      )}
                      {winner && count > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] font-black text-[#00F5FF] bg-[#00F5FF]/10 px-1.5 py-0.5 rounded-md">
                          <Trophy className="w-2.5 h-2.5" /> MVP
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-black tabular-nums text-zinc-300 flex-shrink-0">{count}표</span>
                  <div className="w-5 flex-shrink-0 flex items-center justify-center">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
                    ) : selected ? (
                      <Check className="w-4 h-4 text-[#00F5FF]" />
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
