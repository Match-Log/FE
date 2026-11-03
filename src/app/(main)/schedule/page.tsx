'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { matchApi } from '@/api/match';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import type { Match } from '@/types';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_KO = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getMatchDateKey(dateStr: string) {
  return dateStr.slice(0, 10);
}

function formatListDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const monthStr = MONTH_KO[d.getMonth()];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return { day, month: monthStr, time: `${hh}:${mm}` };
}

export default function SchedulePage() {
  const router = useRouter();
  const { teamId, role } = useTeamStore();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    Promise.all([
      matchApi.getMatches(teamId, 'SCHEDULED'),
      matchApi.getMatches(teamId, 'COMPLETED'),
    ])
      .then(([s, c]) => setMatches([...s.data, ...c.data]))
      .catch(() => setMatches([]))
      .finally(() => setIsLoading(false));
  }, [teamId]);

  const matchByDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    matches.forEach((m) => {
      const key = getMatchDateKey(m.matchDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return map;
  }, [matches]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const calendarCells: { day: number; isCurrentMonth: boolean; dateKey: string }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarCells.push({ day: d, isCurrentMonth: false, dateKey: toDateKey(prevY, prevM, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, isCurrentMonth: true, dateKey: toDateKey(viewYear, viewMonth, d) });
  }
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarCells.push({ day: d, isCurrentMonth: false, dateKey: toDateKey(nextY, nextM, d) });
  }

  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const upcomingMatches = matches
    .filter((m) => m.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

  const pastMatches = matches
    .filter((m) => m.status === 'COMPLETED')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());

  const handleDayClick = (dateKey: string) => {
    const dayMatches = matchByDate.get(dateKey);
    if (dayMatches && dayMatches.length > 0) {
      router.push(`/matches/${dayMatches[0].matchId}`);
    } else if (role === 'MANAGER') {
      router.push(`/schedule/create`);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 z-50 bg-[#05060B]/90 backdrop-blur-md border-b border-white/5">
        <h1 className="text-xl font-black uppercase tracking-tight">경기 일정</h1>
        {role === 'MANAGER' && (
          <Link
            href="/schedule/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-[#00F5FF]/30 bg-[#00F5FF]/5 text-[#00F5FF]"
          >
            <Plus className="w-3.5 h-3.5" /> 경기 생성
          </Link>
        )}
      </header>

      <main className="px-5 mt-6 space-y-8 pb-28 relative">
        <GridBackground />

        {/* Calendar */}
        <section className="bg-white/[0.02] border border-white/5 backdrop-blur-sm rounded-3xl p-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black tracking-tight">
              {viewYear}년 {MONTH_KO[viewMonth]}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {WEEKDAYS.map((d) => (
              <span key={d} className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                {d}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarCells.map((cell, i) => {
              const hasMatch = matchByDate.has(cell.dateKey);
              const matchesOnDay = matchByDate.get(cell.dateKey) ?? [];
              const hasScheduled = matchesOnDay.some((m) => m.status === 'SCHEDULED');
              const hasPast = matchesOnDay.some((m) => m.status === 'COMPLETED');
              const isToday = cell.dateKey === todayKey;

              return (
                <div
                  key={i}
                  className="aspect-square flex items-center justify-center cursor-pointer"
                  onClick={() => cell.isCurrentMonth && handleDayClick(cell.dateKey)}
                >
                  <div
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold transition-all',
                      !cell.isCurrentMonth && 'text-zinc-800',
                      cell.isCurrentMonth && !hasMatch && !isToday && 'text-white hover:bg-white/5',
                      isToday && !hasMatch && 'border border-white/30 text-white',
                      hasScheduled &&
                        cell.isCurrentMonth &&
                        'text-black font-black shadow-[0_0_15px_rgba(0,245,255,0.5)]',
                      hasPast && !hasScheduled && cell.isCurrentMonth && 'border border-purple-500/40 text-purple-400'
                    )}
                    style={
                      hasScheduled && cell.isCurrentMonth
                        ? { background: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)' }
                        : hasPast && !hasScheduled && cell.isCurrentMonth
                        ? { background: 'rgba(113, 23, 234, 0.2)' }
                        : undefined
                    }
                  >
                    {cell.day}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <section className="space-y-4 relative z-10">
            <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">예정 경기</h3>
            {upcomingMatches.map((match) => {
              const { day, month, time } = formatListDate(match.matchDate);
              return (
                <Link key={match.matchId} href={`/matches/${match.matchId}`}>
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-4 hover:border-[#00F5FF]/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-900 rounded-xl flex flex-col items-center justify-center border border-white/5">
                          <span className="text-sm font-black">{day}</span>
                          <span className="text-[9px] font-bold text-zinc-500">{month}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">
                            vs {match.opponentTeam}
                          </h4>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                            {match.location}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-[9px] font-black px-2 py-1 rounded-md uppercase',
                          match.homeAway === 'HOME'
                            ? 'bg-cyan-400/10 border border-cyan-400/20 text-[#00F5FF]'
                            : 'bg-purple-400/10 border border-purple-400/20 text-purple-400'
                        )}
                      >
                        {match.homeAway === 'HOME' ? 'Home' : 'Away'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {match.leagueInfo && (
                        <span className="text-[9px] font-black text-[#00F5FF] bg-cyan-400/10 px-2.5 py-1.5 rounded-lg border border-cyan-400/20">
                          {match.leagueInfo}
                        </span>
                      )}
                      <span className="text-[9px] font-black text-zinc-400 bg-zinc-800 px-2.5 py-1.5 rounded-lg">
                        {time} · {match.location}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        {/* Past Matches */}
        {pastMatches.length > 0 && (
          <section className="space-y-4 relative z-10">
            <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">지난 경기</h3>
            {pastMatches.map((match) => {
              const { day, month } = formatListDate(match.matchDate);
              const hasScore = match.myScore != null && match.opponentScore != null;
              const won =
                hasScore && match.myScore! > match.opponentScore!
                  ? 'text-[#00F5FF]'
                  : hasScore && match.myScore! < match.opponentScore!
                  ? 'text-purple-400'
                  : 'text-zinc-400';
              return (
                <Link key={match.matchId} href={`/matches/${match.matchId}`}>
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-900 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-xs font-black">{day}</span>
                        <span className="text-[8px] font-bold text-zinc-600">{month}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase">vs {match.opponentTeam}</h4>
                        <p className="text-[8px] text-zinc-500 font-bold uppercase">{match.location}</p>
                      </div>
                    </div>
                    {hasScore && (
                      <span className={cn('text-sm font-black tracking-tighter', won)}>
                        {match.myScore} : {match.opponentScore}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        {!isLoading && matches.length === 0 && (
          <div className="relative z-10 text-center py-16">
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">경기 기록이 없습니다</p>
          </div>
        )}
      </main>
    </div>
  );
}
