'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home as HomeIcon, Bell, Settings, ChevronRight, Users, Megaphone, History } from 'lucide-react';
import { toast } from 'sonner';
import { matchApi } from '@/api/match';
import { voteApi } from '@/api/vote';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import type { Match, Vote } from '@/types';
import { cn } from '@/lib/utils';

function getDaysUntil(dateStr: string): number {
  const matchDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatUpcomingDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate();
  const weekday = date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${month} ${day} (${weekday}) ${hh}:${mm}`;
}

function formatRecentDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(date);
}

function getMatchResult(match: Match) {
  if (match.myScore == null || match.opponentScore == null) return null;
  if (match.myScore > match.opponentScore) return { label: '승', color: 'text-[#00F5FF]' };
  if (match.myScore < match.opponentScore) return { label: '패', color: 'text-purple-500' };
  return { label: '무', color: 'text-zinc-500' };
}

export default function HomePage() {
  const router = useRouter();
  const { teamId, teamName, playerId, role } = useTeamStore();
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  const userName =
    typeof window !== 'undefined' ? localStorage.getItem('userName') || '선수' : '선수';

  const loadData = useCallback(async () => {
    if (!teamId) return;
    setIsLoading(true);
    try {
      const [scheduledRes, completedRes] = await Promise.all([
        matchApi.getMatches(teamId, 'SCHEDULED'),
        matchApi.getMatches(teamId, 'COMPLETED'),
      ]);
      const upcoming = scheduledRes.data[0] ?? null;
      setUpcomingMatch(upcoming);
      setRecentMatches(completedRes.data.slice(0, 3));
      if (upcoming) {
        const votesRes = await voteApi.getVotes(upcoming.matchId);
        setVotes(votesRes.data);
      }
    } catch {
      // silent fail: show empty states
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (!teamId) {
      router.push('/team/select');
      return;
    }
    loadData();
  }, [teamId, loadData, router]);

  const myVote = votes.find((v) => v.playerId === playerId);
  const attendCount = votes.filter((v) => v.status === 'ATTEND').length;
  const absentCount = votes.filter((v) => v.status === 'ABSENT').length;
  const pendingCount = votes.filter((v) => v.status === 'PENDING').length;

  const handleVote = async (status: 'ATTEND' | 'ABSENT') => {
    if (!upcomingMatch || isVoting) return;
    setIsVoting(true);
    try {
      await voteApi.vote(upcomingMatch.matchId, { status });
      const votesRes = await voteApi.getVotes(upcomingMatch.matchId);
      setVotes(votesRes.data);
    } catch {
      toast.error('투표에 실패했습니다');
    } finally {
      setIsVoting(false);
    }
  };

  const displayTeamName = teamName ?? 'My Team';
  const daysUntil = upcomingMatch ? getDaysUntil(upcomingMatch.matchDate) : null;

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-[#05060B]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#111218] border border-white/5 rounded-xl">
            <HomeIcon className="w-4 h-4 text-zinc-400" />
          </div>
          <h1 className="text-xl font-black tracking-tight italic uppercase">{displayTeamName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md">
            <span
              className={cn(
                'text-[9px] font-black uppercase tracking-widest',
                role === 'MANAGER' ? 'text-purple-400' : 'text-[#00F5FF]'
              )}
            >
              {role === 'MANAGER' ? 'Manager' : 'Player'}
            </span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center relative bg-[#111218] border border-white/5 rounded-xl">
            <Bell className="w-4 h-4 text-zinc-400" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-purple-500 rounded-full border-2 border-[#05060B]" />
          </button>
          <Link
            href="/team/settings"
            className="w-10 h-10 flex items-center justify-center bg-[#111218] border border-white/5 rounded-xl"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>
      </header>

      <main className="px-6 pt-2 space-y-8 pb-28 relative">
        <GridBackground />

        {/* Upcoming Match Card */}
        <section
          className="p-8 border border-[#00F5FF]/10 rounded-[2rem]"
          style={{ background: 'rgba(18, 20, 32, 0.4)', backdropFilter: 'blur(20px)' }}
        >
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
            </div>
          ) : !upcomingMatch ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">No Upcoming Match</p>
              <p className="text-zinc-700 text-[10px]">예정된 경기가 없습니다</p>
              {role === 'MANAGER' && (
                <Link
                  href="/schedule/create"
                  className="inline-block mt-4 px-6 py-3 accent-gradient text-black text-xs font-black uppercase tracking-widest rounded-xl"
                >
                  + 경기 생성
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-[#00F5FF] italic uppercase">
                    {daysUntil === 0 ? 'D-Day' : daysUntil != null ? `D-${daysUntil}` : ''}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                    {formatUpcomingDate(upcomingMatch.matchDate)}
                  </span>
                </div>
                {upcomingMatch.leagueInfo && (
                  <div className="bg-zinc-900/50 border border-white/5 px-2 py-0.5 rounded text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                    {upcomingMatch.leagueInfo}
                  </div>
                )}
              </div>

              <Link href={`/matches/${upcomingMatch.matchId}`}>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2 hover:text-[#00F5FF] transition-colors">
                  VS {upcomingMatch.opponentTeam}
                </h2>
              </Link>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-10 italic">
                {upcomingMatch.location}
              </p>

              {/* Vote Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <button
                  onClick={() => handleVote('ATTEND')}
                  disabled={isVoting}
                  className={cn(
                    'py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]',
                    myVote?.status === 'ATTEND'
                      ? 'accent-gradient text-black shadow-[0_0_20px_rgba(0,245,255,0.2)]'
                      : 'bg-[#1A1B23] border border-white/5 text-zinc-500'
                  )}
                >
                  참석
                </button>
                <button
                  onClick={() => handleVote('ABSENT')}
                  disabled={isVoting}
                  className={cn(
                    'py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]',
                    myVote?.status === 'ABSENT'
                      ? 'accent-gradient text-black shadow-[0_0_20px_rgba(0,245,255,0.2)]'
                      : 'bg-[#1A1B23] border border-white/5 text-zinc-500'
                  )}
                >
                  불참
                </button>
              </div>

              {/* Vote Stats */}
              <div className="flex items-center justify-between px-2">
                <div className="text-center">
                  <p className="text-2xl font-black text-[#00F5FF] mb-1">
                    {String(attendCount).padStart(2, '0')}
                  </p>
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Attend</p>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="text-center">
                  <p className="text-2xl font-black text-zinc-600 mb-1">
                    {String(pendingCount).padStart(2, '0')}
                  </p>
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Pending</p>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="text-center">
                  <p className="text-2xl font-black text-zinc-400 mb-1">
                    {String(absentCount).padStart(2, '0')}
                  </p>
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Absent</p>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Match List Card */}
        <section
          className="p-8 border border-white/5 rounded-[2rem]"
          style={{ background: 'rgba(18, 20, 32, 0.4)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-zinc-600" />
              <h3 className="text-sm font-black uppercase tracking-widest">경기 목록</h3>
            </div>
            <Link
              href="/schedule"
              className="flex items-center gap-1 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-[#00F5FF] transition-colors"
            >
              모두보기 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recentMatches.length === 0 ? (
            <p className="text-center text-zinc-700 text-xs font-bold uppercase tracking-widest py-6">
              완료된 경기가 없습니다
            </p>
          ) : (
            <div className="space-y-8">
              {recentMatches.map((match) => {
                const result = getMatchResult(match);
                return (
                  <Link key={match.matchId} href={`/matches/${match.matchId}`}>
                    <div className="flex items-center justify-between hover:opacity-80 transition-opacity">
                      <div>
                        <h4 className="text-base font-black uppercase tracking-tight">
                          vs {match.opponentTeam}
                        </h4>
                        <p className="text-[10px] font-bold text-zinc-600 mt-1 uppercase tracking-widest italic">
                          {formatRecentDate(match.matchDate)}{' '}
                          {match.leagueInfo ?? (match.matchType === 'SOCCER' ? '축구' : '풋살')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {match.myScore != null && match.opponentScore != null ? (
                          <>
                            <span
                              className={cn(
                                'text-xl font-black italic',
                                result?.label === '무' ? 'text-zinc-600' : 'text-white'
                              )}
                            >
                              {match.myScore} : {match.opponentScore}
                            </span>
                            {result && (
                              <span className={cn('text-[10px] font-black uppercase italic', result.color)}>
                                {result.label}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-zinc-600 text-sm font-black">— : —</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Squad Card */}
          <Link
            href="/squad"
            className="p-6 space-y-6 border border-white/5 rounded-[2rem] cursor-pointer hover:border-[#00F5FF]/20 transition-all"
            style={{ background: 'rgba(18, 20, 32, 0.4)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-zinc-600" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">선수단</h3>
            </div>
            <div className="flex -space-x-3 overflow-hidden">
              {['DF', 'MF', 'FW'].map((pos, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-[#05060B] bg-zinc-900 flex items-center justify-center text-[8px] font-black text-zinc-500"
                >
                  {pos}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#05060B] bg-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-500">
                ...
              </div>
            </div>
          </Link>

          {/* Notice Card */}
          <Link
            href="/board"
            className="p-6 space-y-4 border border-white/5 rounded-[2rem] hover:border-[#00F5FF]/20 transition-all"
            style={{ background: 'rgba(18, 20, 32, 0.4)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center gap-2">
              <Megaphone className="w-3 h-3 text-zinc-600" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">공지</h3>
            </div>
            <div className="space-y-3">
              <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
                공지사항이 없습니다
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
