'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { statApi } from '@/api/stat';
import { lineupApi } from '@/api/lineup';
import { getApiErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { SectionCard, Spinner } from './shared';

interface Props {
  matchId: number;
  playerId: number;
}

// 0 이상 정수만 유지. 빈 값/NaN/음수는 0으로.
function clampStat(value: string): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function StatField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={String(value)}
        onChange={(e) => onChange(clampStat(e.target.value))}
        className="w-full bg-white/[0.03] border border-white/8 rounded-xl py-3 text-center text-2xl font-black tabular-nums text-white focus:outline-none focus:border-[#00F5FF]/40 transition-colors"
      />
    </div>
  );
}

export default function MyStatInput({ matchId, playerId }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isGK, setIsGK] = useState(false);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [saves, setSaves] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // 기존 스탯 pre-fill + 라인업으로 이 경기 GK 여부 판별. 둘 중 하나 실패해도 폼은 노출.
    Promise.allSettled([
      statApi.getPlayerStat(matchId, playerId),
      lineupApi.getLineup(matchId),
    ]).then(([statRes, lineupRes]) => {
      if (cancelled) return;
      if (statRes.status === 'fulfilled') {
        const s = statRes.value.data;
        setGoals(s.goals ?? 0);
        setAssists(s.assists ?? 0);
        setSaves(s.saves ?? 0);
      }
      if (lineupRes.status === 'fulfilled') {
        const lineups = lineupRes.value.data;
        setIsGK(
          Array.isArray(lineups) &&
            lineups.some((l) =>
              l.spots?.some((sp) => sp.playerId === playerId && sp.position === 'GK')
            )
        );
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [matchId, playerId]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // GK가 아니면 saves는 null로 전송 (스펙).
      const res = await statApi.updatePlayerStat(matchId, playerId, {
        goals,
        assists,
        saves: isGK ? saves : null,
      });
      const s = res.data;
      setGoals(s.goals ?? goals);
      setAssists(s.assists ?? assists);
      if (isGK) setSaves(s.saves ?? saves);
      toast.success('스탯이 저장되었습니다');
    } catch (err) {
      // BE의 403/409 메시지(예: 출석 확정 선수만 작성 가능)를 그대로 노출.
      toast.error(getApiErrorMessage(err, '스탯 저장에 실패했습니다'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard eyebrow="My Record" title="내 스탯 입력">
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          <div className={cn('grid gap-3', isGK ? 'grid-cols-3' : 'grid-cols-2')}>
            <StatField label="골" value={goals} onChange={setGoals} />
            <StatField label="어시스트" value={assists} onChange={setAssists} />
            {isGK && <StatField label="선방" value={saves} onChange={setSaves} />}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 accent-gradient text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '스탯 저장'}
          </button>
        </div>
      )}
    </SectionCard>
  );
}
