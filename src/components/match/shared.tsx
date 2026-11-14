'use client';

import type { ReactNode, TextareaHTMLAttributes } from 'react';
import { cn, getNameInitials } from '@/lib/utils';
import type { TacticOption } from '@/constants/tactic';

export const GLASS_STYLE = { background: 'rgba(18, 20, 32, 0.5)', backdropFilter: 'blur(20px)' } as const;

export function SectionCard({
  eyebrow,
  title,
  action,
  children,
  className,
}: {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn('p-5 border border-white/5 rounded-3xl relative z-10', className)}
      style={GLASS_STYLE}
    >
      {(eyebrow || title || action) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {eyebrow && (
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">{eyebrow}</p>
            )}
            {title && <h3 className="text-sm font-black tracking-tight">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-5 h-5 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin',
        className
      )}
    />
  );
}

export function EmptyState({ icon, title, desc }: { icon: ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center text-center py-6 gap-2">
      <div className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center text-zinc-600">
        {icon}
      </div>
      <p className="text-xs font-black text-zinc-400">{title}</p>
      {desc && <p className="text-[11px] font-bold text-zinc-600 leading-relaxed">{desc}</p>}
    </div>
  );
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full resize-none rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm font-bold text-white',
        'placeholder:text-zinc-700 focus:outline-none focus:border-[#00F5FF]/50 transition-colors',
        className
      )}
    />
  );
}

export function GhostButton({
  children,
  onClick,
  tone = 'cyan',
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'cyan' | 'zinc';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-8 px-3 rounded-lg text-[10px] font-black flex items-center gap-1.5 shrink-0 transition-colors',
        tone === 'cyan'
          ? 'border border-[#00F5FF]/30 bg-[#00F5FF]/10 text-[#00F5FF] hover:bg-[#00F5FF]/20'
          : 'border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
      )}
    >
      {children}
    </button>
  );
}

export function Avatar({ name, image, size = 'md' }: { name: string; image?: string; size?: 'sm' | 'md' }) {
  return (
    <div
      className={cn(
        'rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0',
        size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className={cn('font-black text-zinc-400', size === 'sm' ? 'text-[8px]' : 'text-[10px]')}>
          {getNameInitials(name)}
        </span>
      )}
    </div>
  );
}

/**
 * 전술 항목 한 줄. 모든 선택지를 보여주고 선택된 것만 강조한다.
 * editable이면 탭해서 고르고, 이미 선택된 걸 다시 누르면 해제(null)된다.
 */
export function OptionRow<T extends string>({
  label,
  options,
  value,
  editable,
  onChange,
}: {
  label: string;
  options: TacticOption<T>[];
  value: T | null | undefined;
  editable?: boolean;
  onChange?: (next: T | null) => void;
}) {
  const selected = options.find((o) => o.value === value);
  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-black text-zinc-400">{label}</span>
        {!selected && !editable && <span className="text-[10px] font-bold text-zinc-700">미정</span>}
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => {
          const isOn = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              disabled={!editable}
              onClick={() => onChange?.(isOn ? null : o.value)}
              className={cn(
                'h-9 rounded-lg text-[11px] font-black transition-all',
                isOn
                  ? 'bg-[#00F5FF]/12 border border-[#00F5FF]/50 text-[#00F5FF] shadow-[0_0_12px_rgba(0,245,255,0.15)]'
                  : 'bg-white/[0.02] border border-white/5 text-zinc-600',
                editable && !isOn && 'hover:border-white/15 hover:text-zinc-300',
                !editable && 'cursor-default'
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {selected && <p className="text-[10px] font-bold text-zinc-600 mt-1.5">{selected.hint}</p>}
    </div>
  );
}

export function ToggleRow({
  label,
  hint,
  value,
  editable,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean | null | undefined;
  editable?: boolean;
  onChange?: (next: boolean) => void;
}) {
  const on = value === true;
  return (
    <div className="py-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-black text-zinc-400">{label}</p>
        {hint && <p className="text-[10px] font-bold text-zinc-600 mt-0.5">{hint}</p>}
      </div>
      {editable ? (
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => onChange?.(!on)}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors shrink-0',
            on ? 'accent-gradient' : 'bg-white/10'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all',
              on ? 'left-[22px]' : 'left-0.5'
            )}
          />
        </button>
      ) : (
        <span
          className={cn(
            'text-[10px] font-black px-2.5 py-1 rounded-md',
            value == null
              ? 'text-zinc-700'
              : on
              ? 'bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-[#00F5FF]'
              : 'bg-white/5 border border-white/10 text-zinc-500'
          )}
        >
          {value == null ? '미정' : on ? 'ON' : 'OFF'}
        </span>
      )}
    </div>
  );
}

/** 1~10 평점 링. 8 이상 시안, 5 미만 퍼플. */
export function RatingRing({ rating, size = 88 }: { rating: number | null | undefined; size?: number }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = rating ? Math.min(10, Math.max(0, rating)) / 10 : 0;
  const color = ratingColor(rating);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="rating-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F5FF" />
            <stop offset="100%" stopColor="#7000FF" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#rating-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-2xl font-black tabular-nums leading-none', color)}>{rating ?? '-'}</span>
        <span className="text-[9px] font-black text-zinc-600 mt-0.5">/ 10</span>
      </div>
    </div>
  );
}

export function ratingColor(rating: number | null | undefined) {
  if (rating == null) return 'text-zinc-600';
  if (rating >= 8) return 'text-[#00F5FF]';
  if (rating < 5) return 'text-[#A970FF]';
  return 'text-white';
}

export function TagChip({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex items-center h-7 px-2.5 rounded-full text-[10px] font-black border transition-colors',
        active
          ? 'bg-[#7000FF]/20 border-[#7000FF]/50 text-[#C9A6FF]'
          : 'bg-white/[0.03] border-white/10 text-zinc-500',
        onClick && !active && 'hover:text-zinc-300 hover:border-white/20'
      )}
    >
      {tag}
    </Comp>
  );
}

export function formatUpdatedAt(value?: string) {
  if (!value) return null;
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
