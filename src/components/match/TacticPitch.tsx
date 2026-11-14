'use client';

import { cn } from '@/lib/utils';
import { DEFENSIVE_LINE_OPTIONS, PRESSING_TRIGGER_OPTIONS, PRESSING_INTENSITY_LABELS } from '@/constants/tactic';
import type { TacticFields } from '@/types';

// 우리 팀은 아래 → 위로 공격한다. 값은 위에서부터의 %.
const LINE_Y = { HIGH_LINE: 46, MID_BLOCK: 62, LOW_BLOCK: 78 } as const;
const PRESS_ZONE = {
  FRONT: { top: 0, height: 34 },
  MIDFIELD: { top: 33, height: 34 },
  OWN_HALF: { top: 50, height: 50 },
} as const;

/** 수비 라인 높이·간격, 압박 시작 지점, 오프사이드 트랩을 미니 피치로 보여준다. */
export function TacticPitch({ tactic }: { tactic: TacticFields }) {
  const line = tactic.defensiveLineHeight;
  const press = tactic.pressingTrigger;
  const lineWidth = tactic.defensiveSpacing === 'COMPACT' ? 52 : tactic.defensiveSpacing === 'WIDE' ? 84 : 68;
  const isEmpty = !line && !press;

  return (
    <div className="flex gap-4 items-stretch">
      <div
        className="relative flex-1 max-w-[180px] aspect-[3/4] rounded-xl overflow-hidden border border-white/10"
        style={{ background: 'linear-gradient(180deg, rgba(0,245,255,0.04), rgba(112,0,255,0.05))' }}
      >
        {/* pitch markings */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
        <div className="absolute left-1/2 top-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-0 w-1/2 h-[14%] -translate-x-1/2 border-x border-b border-white/10" />
        <div className="absolute left-1/2 bottom-0 w-1/2 h-[14%] -translate-x-1/2 border-x border-t border-white/10" />

        {/* pressing zone */}
        {press && (
          <div
            className="absolute inset-x-0 transition-all duration-500"
            style={{
              top: `${PRESS_ZONE[press].top}%`,
              height: `${PRESS_ZONE[press].height}%`,
              background: 'linear-gradient(180deg, rgba(112,0,255,0.28), rgba(112,0,255,0.06))',
            }}
          >
            <span className="absolute right-1.5 top-1 text-[7px] font-black tracking-widest text-[#C9A6FF]">PRESS</span>
          </div>
        )}

        {/* defensive line */}
        {line && (
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-500"
            style={{ top: `${LINE_Y[line]}%`, width: `${lineWidth}%` }}
          >
            <div className="h-[2px] rounded-full bg-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.7)]" />
            <div className="absolute inset-x-0 -top-[3px] flex justify-between">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#05060B] border-2 border-[#00F5FF]" />
              ))}
            </div>
            {tactic.offsideTrap && (
              <span className="absolute left-1/2 -translate-x-1/2 -top-4 text-[7px] font-black tracking-widest text-[#00F5FF] whitespace-nowrap">
                OFFSIDE TRAP
              </span>
            )}
          </div>
        )}

        {/* attack direction */}
        <span className="absolute left-1.5 bottom-1 text-[7px] font-black tracking-widest text-zinc-600">ATTACK ↑</span>

        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-zinc-700">미정</span>
          </div>
        )}
      </div>

      {/* legend */}
      <div className="flex-1 flex flex-col justify-center gap-4 min-w-0">
        <LegendItem
          color="bg-[#00F5FF]"
          label="수비 라인"
          value={DEFENSIVE_LINE_OPTIONS.find((o) => o.value === line)?.label}
          sub={tactic.defensiveSpacing === 'COMPACT' ? '좁은 간격' : tactic.defensiveSpacing === 'WIDE' ? '넓은 간격' : undefined}
        />
        <LegendItem
          color="bg-[#7000FF]"
          label="압박 시작"
          value={PRESSING_TRIGGER_OPTIONS.find((o) => o.value === press)?.label}
        />
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">압박 강도</p>
          <IntensityMeter value={tactic.pressingIntensity} />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value, sub }: { color: string; label: string; value?: string; sub?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={cn('w-2 h-2 rounded-full', color)} />
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{label}</p>
      </div>
      <p className={cn('text-sm font-black', value ? 'text-white' : 'text-zinc-700')}>{value ?? '미정'}</p>
      {sub && <p className="text-[10px] font-bold text-zinc-500">{sub}</p>}
    </div>
  );
}

export function IntensityMeter({
  value,
  editable,
  onChange,
}: {
  value: number | null | undefined;
  editable?: boolean;
  onChange?: (next: number | null) => void;
}) {
  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const on = value != null && n <= value;
          return (
            <button
              key={n}
              type="button"
              disabled={!editable}
              onClick={() => onChange?.(value === n ? null : n)}
              aria-label={`압박 강도 ${n}`}
              className={cn(
                'flex-1 rounded-sm transition-all',
                editable ? 'h-6' : 'h-2',
                on ? '' : 'bg-white/[0.06]',
                !editable && 'cursor-default'
              )}
              style={on ? { background: `linear-gradient(90deg, #00F5FF, #7000FF)`, opacity: 0.45 + n * 0.11 } : undefined}
            />
          );
        })}
      </div>
      <p className={cn('text-[10px] font-black mt-1', value ? 'text-zinc-300' : 'text-zinc-700')}>
        {value ? `${value} · ${PRESSING_INTENSITY_LABELS[value]}` : '미정'}
      </p>
    </div>
  );
}
