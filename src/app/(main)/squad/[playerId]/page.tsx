'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, PenLine } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { playerApi } from '@/api/player';
import { matchApi } from '@/api/match';
import { statApi } from '@/api/stat';
import { feedbackApi } from '@/api/feedback';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { cn } from '@/lib/utils';
import type { Player, PlayerStat, Feedback, Match } from '@/types';

type ProfileTab = 'info' | 'feedback';

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr));
}

function getInitials(name: string) {
  return name.slice(0, 2);
}

export default function PlayerProfilePage() {
  const params = useParams<{ playerId: string }>();
  const router = useRouter();
  const { teamId, playerId: myPlayerId, role: userRole } = useTeamStore();
  const targetPlayerId = Number(params.playerId);

  const [tab, setTab] = useState<ProfileTab>('info');
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<(PlayerStat & { opponentTeam: string; matchDate: string })[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = myPlayerId === targetPlayerId;
  const canEdit = isOwnProfile || userRole === 'MANAGER';

  useEffect(() => {
    if (!teamId || !targetPlayerId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const playerRes = await playerApi.getPlayer(targetPlayerId);
        setPlayer(playerRes.data);

        // Load completed matches and then get stats per match
        const matchesRes = await matchApi.getMatches(teamId, 'COMPLETED');
        const completedMatches: Match[] = matchesRes.data.slice(0, 8);

        type StatEntry = PlayerStat & { opponentTeam: string; matchDate: string };
        type FeedbackEntry = Feedback & { opponentTeam: string };

        const statResults = await Promise.allSettled(
          completedMatches.map((m) =>
            statApi.getPlayerStat(m.matchId, targetPlayerId).then((r): StatEntry => ({
              ...r.data,
              matchId: m.matchId,
              opponentTeam: m.opponentTeam,
              matchDate: m.matchDate,
            }))
          )
        );
        const validStats = statResults
          .filter((r) => r.status === 'fulfilled')
          .map((r) => (r as PromiseFulfilledResult<StatEntry>).value);
        setStats(validStats);

        const feedbackResults = await Promise.allSettled(
          completedMatches.map((m) =>
            feedbackApi.getFeedback(m.matchId, targetPlayerId).then((r): FeedbackEntry => ({
              ...r.data,
              matchId: m.matchId,
              opponentTeam: m.opponentTeam,
            }))
          )
        );
        const validFeedbacks = feedbackResults
          .filter((r) => r.status === 'fulfilled')
          .map((r) => (r as PromiseFulfilledResult<FeedbackEntry>).value);
        setFeedbacks(validFeedbacks);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [teamId, targetPlayerId]);

  // Aggregated season stats
  const totalGoals = stats.reduce((sum, s) => sum + (s.goals ?? 0), 0);
  const totalAssists = stats.reduce((sum, s) => sum + (s.assists ?? 0), 0);
  const avgRating =
    stats.length > 0
      ? (stats.reduce((sum, s) => sum + (s.rating ?? 0), 0) / stats.length).toFixed(1)
      : '-';

  // Chart data (recent 5, ascending date)
  const chartData = [...stats]
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
    .slice(-5)
    .map((s) => ({
      name: `vs ${s.opponentTeam.slice(0, 4)}`,
      rating: s.rating,
    }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05060B] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060B] text-white grid-pattern">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 z-50 bg-[#05060B]/80 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Player Profile</h1>
        {canEdit ? (
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400">
            <PenLine className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </header>

      {/* Profile Hero */}
      <section
        className="px-6 pt-6 pb-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(0,242,254,0.15) 0%, rgba(113,23,234,0.08) 100%)' }}
      >
        {/* Ghost position text */}
        <span className="absolute right-0 bottom-0 text-[180px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
          {player?.mainPosition ?? ''}
        </span>
        <div className="relative z-10 flex items-end gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-[32px] overflow-hidden border-2 border-cyan-500/30 p-1 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20">
              <div className="w-full h-full rounded-[26px] bg-[#111218] flex items-center justify-center text-3xl font-black text-[#00F5FF]">
                {player ? getInitials(player.name) : '??'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-cyan-400 to-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-[#05060B] shadow-lg">
              <span className="text-[10px] font-black text-black">{player?.mainPosition}</span>
            </div>
          </div>
          {/* Info */}
          <div className="flex-grow pb-1">
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-1">{player?.name ?? '-'}</h2>
            <p className="text-xs text-zinc-400 font-bold">#{player?.number}</p>
            {/* Position tags */}
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {player?.mainPosition && (
                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-cyan-400/10 border border-cyan-400/30 text-[#00F5FF] shadow-[0_0_10px_rgba(0,242,254,0.3)]">
                  {player.mainPosition}
                </span>
              )}
              {player?.subPositions.map((pos) => (
                <span key={pos} className="px-3 py-1 rounded-lg text-[9px] font-black text-zinc-500 uppercase bg-zinc-800/80">
                  {pos}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tab nav */}
      <nav className="px-6 flex border-b border-white/5 bg-[#05060B] sticky top-[68px] z-40">
        {(['info', 'feedback'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-4 text-[10px] font-black uppercase tracking-widest relative transition-all',
              tab === t ? 'text-[#00F5FF]' : 'text-zinc-600'
            )}
          >
            {t === 'info' ? '정보' : '피드백'}
            {tab === t && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent shadow-[0_0_10px_rgba(0,242,254,0.8)]" />
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="px-6 py-8 space-y-8 pb-28 relative">
        <GridBackground />

        {/* ── Info tab ── */}
        {tab === 'info' && (
          <>
            {/* Basic info grid */}
            <section className="relative z-10">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 ml-1">기본 정보</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '이름', value: player?.name },
                  { label: '주포지션', value: player?.mainPosition, highlight: true },
                  { label: '부포지션', value: player?.subPositions.join(' / ') || '-' },
                  { label: '등번호', value: player?.number != null ? `#${player.number}` : '-' },
                ].map(({ label, value, highlight }) => (
                  <div
                    key={label}
                    className="p-4 rounded-[20px] bg-white/[0.03] border border-white/5"
                    style={{ backdropFilter: 'blur(12px)' }}
                  >
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
                    <p className={cn('text-sm font-black', highlight ? 'text-[#00F5FF]' : 'text-white')}>
                      {value ?? '-'}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Season stats */}
            <section className="relative z-10">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 ml-1">이번 시즌 요약</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: stats.length, label: '출전' },
                  { val: totalGoals, label: '골' },
                  { val: totalAssists, label: '어시' },
                  { val: avgRating, label: '평점', highlight: true },
                ].map(({ val, label, highlight }) => (
                  <div
                    key={label}
                    className="p-3 text-center rounded-[20px] bg-white/[0.03] border border-white/5"
                    style={{ backdropFilter: 'blur(12px)' }}
                  >
                    <p className={cn('text-xl font-black', highlight ? 'accent-gradient-text' : 'text-white')}>
                      {val}
                    </p>
                    <p className="text-[8px] font-black text-zinc-500 uppercase mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Rating chart */}
            {chartData.length > 1 && (
              <section className="relative z-10">
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 ml-1">최근 경기 평점 추이</h3>
                <div
                  className="rounded-[20px] bg-white/[0.03] border border-white/5 p-4"
                  style={{ backdropFilter: 'blur(12px)' }}
                >
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#52525b', fontSize: 8, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 10]}
                        tick={{ fill: '#52525b', fontSize: 8 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#111218',
                          border: '1px solid rgba(0,245,255,0.2)',
                          borderRadius: 8,
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#fff',
                        }}
                        cursor={{ stroke: 'rgba(0,245,255,0.2)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="url(#ratingGrad)"
                        strokeWidth={2}
                        dot={{ fill: '#00F5FF', r: 3, strokeWidth: 0 }}
                        activeDot={{ fill: '#00F5FF', r: 5, strokeWidth: 0 }}
                      />
                      <defs>
                        <linearGradient id="ratingGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#00F5FF" />
                          <stop offset="100%" stopColor="#7000FF" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Feedback tab ── */}
        {tab === 'feedback' && (
          <>
            {/* Coach feedback */}
            <section className="relative z-10">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 ml-1">코치 피드백</h3>
              {feedbacks.length === 0 ? (
                <p className="text-zinc-700 text-xs font-bold uppercase tracking-widest text-center py-6">
                  피드백이 없습니다
                </p>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((fb, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-[20px] bg-white/[0.03] border border-white/5 border-l-4 border-l-[#00F5FF]"
                      style={{ backdropFilter: 'blur(12px)' }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#00F5FF]/20 flex items-center justify-center text-[7px] font-black text-[#00F5FF]">
                            {fb.coachName ? fb.coachName.slice(0, 1) : 'C'}
                          </div>
                          <span className="text-[11px] font-black uppercase">{fb.coachName ?? '코치'}</span>
                        </div>
                        {fb.createdAt && (
                          <span className="text-[9px] font-bold text-zinc-500">{formatDate(fb.createdAt)}</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">{fb.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent match ratings */}
            {stats.length > 0 && (
              <section className="relative z-10">
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 ml-1">최근 경기 평점</h3>
                <div className="space-y-2">
                  {[...stats]
                    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
                    .slice(0, 5)
                    .map((s, i) => (
                      <div
                        key={i}
                        className="px-5 py-4 rounded-[20px] bg-white/[0.03] border border-white/5 flex items-center justify-between"
                        style={{ backdropFilter: 'blur(12px)' }}
                      >
                        <div>
                          <p className="text-xs font-black mb-1">VS {s.opponentTeam}</p>
                          <p className="text-[9px] font-bold text-zinc-500">
                            {new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(new Date(s.matchDate))}
                          </p>
                        </div>
                        <div
                          className="px-3 py-1.5 rounded-xl text-black font-black text-sm shadow-[0_4px_15px_rgba(0,242,254,0.3)]"
                          style={{ background: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)' }}
                        >
                          {s.rating?.toFixed(1) ?? '-'}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
