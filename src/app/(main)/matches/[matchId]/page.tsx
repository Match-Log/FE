'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Clock, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { matchApi } from '@/api/match';
import { voteApi } from '@/api/vote';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { cn, getNameInitials } from '@/lib/utils';
import type { Match, VoteItem } from '@/types';


function formatMatchDate(dateStr: string) {
  const d = new Date(dateStr);
  const date = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(d);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${date} ${hh}:${mm}`;
}

export default function MatchInfoPage() {
  const params = useParams<{ matchId: string }>();
  const { playerId, role, teamName } = useTeamStore();
  const matchId = Number(params.matchId);

  const [match, setMatch] = useState<Match | null>(null);
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    Promise.all([matchApi.getMatch(matchId), voteApi.getVotes(matchId)])
      .then(([m, v]) => { setMatch(m.data); setVotes(v.data.votes); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [matchId]);

  const myVote = votes.find((v) => v.playerId === playerId);
  const attendees = votes.filter((v) => v.status === 'ATTEND');
  const absentees = votes.filter((v) => v.status === 'ABSENT');
  const pending = votes.filter((v) => v.status === 'PENDING');
  const total = votes.length;
  const attendPct = total > 0 ? Math.round((attendees.length / total) * 100) : 0;

  const handleVote = async (status: 'ATTEND' | 'ABSENT') => {
    if (!match || isVoting || match.finished) return;
    const nextStatus = myVote?.status === status ? 'PENDING' : status;
    setIsVoting(true);
    try {
      await voteApi.vote(matchId, { status: nextStatus });
      const res = await voteApi.getVotes(matchId);
      setVotes(res.data.votes);
    } catch {
      toast.error('투표에 실패했습니다');
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">경기 정보를 불러올 수 없습니다</p>
      </div>
    );
  }

  const isScheduled = !match.finished;
  const isCompleted = match.finished;
  const myScore = match.homeAway === 'HOME' ? match.scoreHome : match.scoreAway;
  const opponentScore = match.homeAway === 'HOME' ? match.scoreAway : match.scoreHome;

  return (
    <main className="px-5 pt-6 pb-28 space-y-6 relative">
      <GridBackground />

      {/* Match Summary Card */}
      <section
        className="p-6 border border-white/5 rounded-3xl relative z-10"
        style={{ background: 'rgba(18, 20, 32, 0.5)', backdropFilter: 'blur(20px)' }}
      >
        {/* Status badge */}
        <div className="flex justify-between items-start mb-6">
          <span
            className={cn(
              'text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest',
              isScheduled
                ? 'bg-[#00F5FF]/10 border border-[#00F5FF]/20 text-[#00F5FF]'
                : isCompleted
                ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                : 'bg-zinc-700/30 border border-zinc-700 text-zinc-500'
            )}
          >
            {isScheduled ? '예정' : isCompleted ? '완료' : '취소'}
          </span>
          <span
            className={cn(
              'text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest',
              match.homeAway === 'HOME'
                ? 'bg-cyan-400/10 border border-cyan-400/20 text-[#00F5FF]'
                : 'bg-purple-400/10 border border-purple-400/20 text-purple-400'
            )}
          >
            {match.homeAway === 'HOME' ? 'Home' : 'Away'}
          </span>
        </div>

        {/* VS */}
        {isCompleted && myScore != null && opponentScore != null ? (
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-6 mb-3">
              <div className="text-center">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{teamName ?? 'My Team'}</p>
                <p className="text-5xl font-black tabular-nums text-[#00F5FF]">{myScore}</p>
              </div>
              <p className="text-2xl font-black text-zinc-700">:</p>
              <div className="text-center">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{match.opponent}</p>
                <p className="text-5xl font-black tabular-nums text-zinc-400">{opponentScore}</p>
              </div>
            </div>
            {myScore > opponentScore ? (
              <span className="text-[11px] font-black text-[#00F5FF] bg-[#00F5FF]/10 px-3 py-1 rounded-full border border-[#00F5FF]/20">승리</span>
            ) : myScore < opponentScore ? (
              <span className="text-[11px] font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">패배</span>
            ) : (
              <span className="text-[11px] font-black text-zinc-400 bg-zinc-700/30 px-3 py-1 rounded-full border border-zinc-700">무승부</span>
            )}
          </div>
        ) : (
          <div className="text-center mb-6">
            <p className="text-3xl font-black italic uppercase tracking-tighter">
              VS {match.opponent}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <Clock className="w-4 h-4 text-zinc-600 flex-shrink-0" />
            <span className="font-semibold">{formatMatchDate(match.matchDate)}</span>
          </div>
          <div className="flex items-start gap-3 text-xs text-zinc-400">
            <MapPin className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold">{match.location}</span>
          </div>
        </div>

      </section>

      {/* Map Preview placeholder */}
      <section className="rounded-3xl overflow-hidden border border-white/5 relative z-10 bg-white/[0.02]">
        <div className="h-32 flex flex-col items-center justify-center gap-2">
          <MapPin className="w-6 h-6 text-zinc-700" />
          <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{match.location}</p>
        </div>
      </section>

      {/* Attendance Section */}
      <section
        className="p-6 border border-white/5 rounded-3xl relative z-10 space-y-5"
        style={{ background: 'rgba(18, 20, 32, 0.5)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest">참석 현황</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-[#00F5FF]">{attendees.length}</span>
            <span className="text-zinc-700 text-sm font-black">/</span>
            <span className="text-sm font-bold text-zinc-500">{total}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${attendPct}%`,
              background: 'linear-gradient(90deg, #00F5FF 0%, #7000FF 100%)',
            }}
          />
        </div>

        {/* Vote buttons (only for scheduled matches) */}
        {isScheduled && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVote('ATTEND')}
              disabled={isVoting}
              className={cn(
                'py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]',
                myVote?.status === 'ATTEND'
                  ? 'accent-gradient text-black'
                  : 'bg-white/[0.03] border border-white/5 text-zinc-500'
              )}
            >
              참석
            </button>
            <button
              onClick={() => handleVote('ABSENT')}
              disabled={isVoting}
              className={cn(
                'py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]',
                myVote?.status === 'ABSENT'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/[0.03] border border-white/5 text-zinc-500'
              )}
            >
              불참
            </button>
          </div>
        )}

        {/* Attend list */}
        {attendees.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00F5FF]" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                참석 {attendees.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {attendees.map((v) => (
                <div
                  key={v.playerId}
                  className="flex items-center gap-2 bg-[#00F5FF]/5 border border-[#00F5FF]/15 rounded-lg px-2.5 py-1.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#00F5FF]/20 flex items-center justify-center text-[7px] font-black text-[#00F5FF]">
                    {getNameInitials(v.name)}
                  </div>
                  <span className="text-[10px] font-black text-white">{v.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Absent list */}
        {absentees.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                불참 {absentees.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {absentees.map((v) => (
                <div
                  key={v.playerId}
                  className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/15 rounded-lg px-2.5 py-1.5"
                >
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[7px] font-black text-purple-400">
                    {getNameInitials(v.name)}
                  </div>
                  <span className="text-[10px] font-black text-zinc-400">{v.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending list */}
        {pending.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                미정 {pending.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pending.map((v) => (
                <div
                  key={v.playerId}
                  className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5"
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[7px] font-black text-zinc-500">
                    {getNameInitials(v.name)}
                  </div>
                  <span className="text-[10px] font-black text-zinc-600">{v.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
