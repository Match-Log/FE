'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { participationApi } from '@/api/participation';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { cn, getNameInitials } from '@/lib/utils';
import type { RosterItem, RoleAssignment } from '@/types';
import { SPECIALIST_ROLES } from '@/constants/specialist';
import {
  POSITION_CATEGORIES,
  POSITION_CATEGORY_LABELS,
  getPositionCategory,
  type PositionCategory,
} from '@/constants/position';

// 전담 선수 섹션: 2개씩 한 페이지(주장·PK / 코너킥 / 프리킥), 좌우로 넘긴다.
const SPECIALIST_PER_PAGE = 2;
const SPECIALIST_PAGES = Array.from(
  { length: Math.ceil(SPECIALIST_ROLES.length / SPECIALIST_PER_PAGE) },
  (_, i) => SPECIALIST_ROLES.slice(i * SPECIALIST_PER_PAGE, (i + 1) * SPECIALIST_PER_PAGE)
);
const SWIPE_THRESHOLD = 40;

type PositionFilter = 'ALL' | PositionCategory;
const POSITION_FILTERS: PositionFilter[] = ['ALL', ...POSITION_CATEGORIES];

// 선수 상세 → 뒤로가기 시 보던 탭을 유지하기 위해 필터를 URL(?pos=FW)에 둔다.
const parseFilter = (value: string | null): PositionFilter =>
  POSITION_FILTERS.includes(value as PositionFilter) ? (value as PositionFilter) : 'ALL';

// 포지션이 없는 선수도 목록에서 빠지지 않도록 별도 그룹으로 보여준다.
type SquadGroup = PositionCategory | 'NONE';
const GROUP_LABELS: Record<SquadGroup, string> = { ...POSITION_CATEGORY_LABELS, NONE: '포지션 미지정' };


// useSearchParams는 Suspense 경계가 필요하다.
export default function SquadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05060B]" />}>
      <SquadContent />
    </Suspense>
  );
}

function SquadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { teamId, teamName } = useTeamStore();
  const [players, setPlayers] = useState<RosterItem[]>([]);
  const filter = parseFilter(searchParams.get('pos'));
  const setFilter = (next: PositionFilter) => {
    // replace: 탭 전환이 히스토리에 쌓이지 않게 한다.
    router.replace(next === 'ALL' ? '/squad' : `/squad?pos=${next}`, { scroll: false });
  };
  const [isLoading, setIsLoading] = useState(true);
  const [roleAssignment, setRoleAssignment] = useState<RoleAssignment | null>(null);
  const [specialistPage, setSpecialistPage] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastPage = SPECIALIST_PAGES.length - 1;
  const goSpecialist = (delta: number) =>
    setSpecialistPage((p) => Math.min(lastPage, Math.max(0, p + delta)));

  useEffect(() => {
    if (!teamId) return;
    participationApi.getTeamPlayers(teamId)
      .then((r) => setPlayers(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
    participationApi.getRoleAssignment(teamId)
      .then((r) => setRoleAssignment(r.data))
      .catch(() => {});
  }, [teamId]);

  const groupOf = (p: RosterItem): SquadGroup => getPositionCategory(p.mainPosition) ?? 'NONE';

  const filtered = filter === 'ALL'
    ? players
    : players.filter((p) => groupOf(p) === filter);

  const counts = Object.fromEntries(
    POSITION_CATEGORIES.map((cat) => [cat, players.filter((p) => groupOf(p) === cat).length])
  ) as Record<PositionCategory, number>;

  const grouped = ([...POSITION_CATEGORIES, 'NONE'] as SquadGroup[]).reduce((acc, group) => {
    const members = filtered.filter((p) => groupOf(p) === group);
    if (members.length > 0) acc.push([group, members]);
    return acc;
  }, [] as [SquadGroup, RosterItem[]][]);

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
            {POSITION_CATEGORIES.map((pos) => (
              <div key={pos} className="text-center">
                <p className="text-xl font-black italic text-zinc-200 mb-0.5">{counts[pos]}</p>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{pos}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Specialists: 주장·세트피스 전담 */}
        <section className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#00F5FF]">Specialists</h2>
            <Link
              href="/squad/specialists"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-[#111218] text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] hover:text-[#00F5FF] hover:border-[#00F5FF]/30 transition-colors"
            >
              Configure <Settings className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goSpecialist(-1)}
              disabled={specialistPage === 0}
              aria-label="이전 전담 선수"
              className="w-7 h-12 shrink-0 flex items-center justify-center rounded-lg text-zinc-400 hover:text-[#00F5FF] disabled:opacity-20 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* 가로 슬라이드. 세로 스크롤과 구분하려고 가로 이동이 더 클 때만 넘긴다. */}
            <div
              className="flex-1 overflow-hidden"
              onTouchStart={(e) => {
                const t = e.touches[0];
                touchStart.current = { x: t.clientX, y: t.clientY };
              }}
              onTouchEnd={(e) => {
                const start = touchStart.current;
                touchStart.current = null;
                if (!start) return;
                const t = e.changedTouches[0];
                const dx = t.clientX - start.x;
                const dy = t.clientY - start.y;
                if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
                goSpecialist(dx < 0 ? 1 : -1);
              }}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${specialistPage * 100}%)` }}
              >
                {SPECIALIST_PAGES.map((page, i) => (
                  <div key={i} className="w-full shrink-0 grid grid-cols-2 gap-3" aria-hidden={i !== specialistPage}>
                    {page.map(({ role, shortLabel, icon: Icon, color, box, filled }) => {
                      const slot = roleAssignment?.[role] ?? null;
                      return (
                        <div
                          key={role}
                          className="p-4 rounded-2xl border border-white/5 flex items-center gap-3 min-w-0"
                          style={{ background: 'rgba(18, 20, 32, 0.6)', backdropFilter: 'blur(20px)' }}
                        >
                          <div className={cn('w-11 h-11 rounded-xl border flex items-center justify-center shrink-0', box)}>
                            <Icon className={cn('w-4 h-4', color)} fill={filled ? 'currentColor' : 'none'} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5 truncate">{shortLabel}</p>
                            <p className={cn('text-sm font-black truncate', slot ? 'text-white' : 'text-zinc-600')}>
                              {slot?.name ?? '미지정'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => goSpecialist(1)}
              disabled={specialistPage === lastPage}
              aria-label="다음 전담 선수"
              className="w-7 h-12 shrink-0 flex items-center justify-center rounded-lg text-zinc-400 hover:text-[#00F5FF] disabled:opacity-20 disabled:pointer-events-none transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {SPECIALIST_PAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSpecialistPage(i)}
                aria-label={`${i + 1}번째 페이지`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === specialistPage ? 'w-5 bg-[#00F5FF]' : 'w-1.5 bg-zinc-700'
                )}
              />
            ))}
          </div>
        </section>

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
            {grouped.map(([pos, group]) => (
              <div key={pos} className="space-y-5">
                <span className="inline-block bg-[#111218] px-3 py-1 rounded-md text-[10px] font-black text-zinc-600 uppercase tracking-[0.15em]">
                  {GROUP_LABELS[pos]}
                </span>
                <div className="space-y-5">
                  {group.map((player) => (
                    <Link key={player.playerId} href={`/squad/${player.playerId}`}>
                      <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center text-[13px] font-black uppercase tracking-tighter border border-[#00F5FF]/15 shadow-[inset_0_0_10px_rgba(0,245,255,0.05)] text-[#00F5FF]"
                            style={{ background: 'linear-gradient(135deg, #1A1B23 0%, #08090E 100%)' }}>
                            {getNameInitials(player.name)}
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
                              {[player.number != null ? `#${player.number}` : null, player.mainPosition ?? '포지션 미지정']
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-zinc-800 uppercase tracking-widest italic">
                          {player.mainPosition ?? '-'}
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
