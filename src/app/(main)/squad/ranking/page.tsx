'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { matchApi } from '@/api/match';
import { statApi } from '@/api/stat';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { cn, getNameInitials } from '@/lib/utils';

type Metric = 'goals' | 'assists' | 'saves';

const TABS: { key: Metric; label: string }[] = [
  { key: 'goals', label: '골' },
  { key: 'assists', label: '도움' },
  { key: 'saves', label: '선방' },
];

interface RankRow {
  playerId: number;
  name: string;
  position?: string;
  goals: number;
  assists: number;
  saves: number;
}

export default function RankingPage() {
  const router = useRouter();
  const { teamId } = useTeamStore();
  const [rows, setRows] = useState<RankRow[]>([]);
  const [tab, setTab] = useState<Metric>('goals');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const matchesRes = await matchApi.getMatches(teamId, 'finished');
        const matches = matchesRes.data;
        // 종료 경기별 스탯을 모아 선수별로 합산. 한 경기가 실패해도 나머지는 집계.
        const results = await Promise.allSettled(
          matches.map((m) => statApi.getMatchStats(m.matchId))
        );
        const acc = new Map<number, RankRow>();
        for (const r of results) {
          if (r.status !== 'fulfilled') continue;
          for (const s of r.value.data.stats ?? []) {
            if (s.playerId == null) continue; // 게스트 등 선수 식별 불가 → 제외
            const cur =
              acc.get(s.playerId) ??
              { playerId: s.playerId, name: s.name ?? '-', position: s.position, goals: 0, assists: 0, saves: 0 };
            cur.goals += s.goals ?? 0;
            cur.assists += s.assists ?? 0;
            cur.saves += s.saves ?? 0;
            if (!cur.position && s.position) cur.position = s.position;
            if ((cur.name === '-' || !cur.name) && s.name) cur.name = s.name;
            acc.set(s.playerId, cur);
          }
        }
        if (!cancelled) setRows([...acc.values()]);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  // 활성 지표 내림차순 → 동률이면 골·도움·이름 순
  const sorted = [...rows].sort(
    (a, b) =>
      b[tab] - a[tab] || b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name, 'ko')
  );
  // 동점은 같은 순위
  let rank = 0;
  let prev: number | null = null;
  const ranked = sorted.map((r, i) => {
    if (r[tab] !== prev) {
      rank = i + 1;
      prev = r[tab];
    }
    return { ...r, rank };
  });

  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-[#05060B]/80 backdrop-blur-md z-40 border-b border-white/5">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="w-11 h-11 flex items-center justify-center bg-[#111218] border border-white/5 rounded-xl"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div className="text-center">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Rankings</p>
          <h1 className="text-base font-black uppercase tracking-[0.15em]">선수 순위</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="px-6 pt-8 pb-28 relative space-y-5">
        <GridBackground />

        {/* 지표 탭 */}
        <div className="relative z-10 grid grid-cols-3 gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]',
                tab === t.key
                  ? 'accent-gradient text-black'
                  : 'bg-white/[0.03] border border-white/5 text-zinc-500'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 relative z-10">
            <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
          </div>
        ) : ranked.length === 0 ? (
          <div className="text-center py-20 relative z-10">
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
              집계된 선수 스탯이 없습니다
            </p>
          </div>
        ) : (
          <div className="relative z-10 space-y-2">
            {/* 헤더 */}
            <div className="flex items-center gap-3 px-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              <span className="w-6 text-center">#</span>
              <span className="flex-1">선수</span>
              <span className="w-9 text-center">골</span>
              <span className="w-9 text-center">도움</span>
              <span className="w-9 text-center">선방</span>
            </div>
            {ranked.map((r) => (
              <Link
                key={r.playerId}
                href={`/squad/${r.playerId}`}
                className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3 hover:bg-white/[0.06] transition-colors active:scale-[0.99]"
              >
                <span
                  className={cn(
                    'w-6 text-center text-sm font-black tabular-nums',
                    r.rank === 1 ? 'text-[#00F5FF]' : r.rank <= 3 ? 'text-zinc-300' : 'text-zinc-600'
                  )}
                >
                  {r.rank}
                </span>
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-black text-zinc-400 flex-shrink-0">
                    {getNameInitials(r.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate">{r.name}</p>
                    {r.position && (
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{r.position}</p>
                    )}
                  </div>
                </div>
                {(['goals', 'assists', 'saves'] as Metric[]).map((m) => (
                  <span
                    key={m}
                    className={cn(
                      'w-9 text-center text-sm font-black tabular-nums',
                      tab === m ? 'text-[#00F5FF]' : 'text-zinc-400'
                    )}
                  >
                    {r[m]}
                  </span>
                ))}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
