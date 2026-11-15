'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { playerApi } from '@/api/player';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { cn, getErrorMessage, getErrorStatus } from '@/lib/utils';
import { POSITION_CATEGORIES, POSITIONS_BY_CATEGORY, POSITION_INFO } from '@/constants/position';
import type { Career, Player, Position, PreferredFoot } from '@/types';

const POSITION_GROUPS = POSITION_CATEGORIES.map((category) => ({
  label: category,
  positions: POSITIONS_BY_CATEGORY[category],
}));

const PREFERRED_FOOT: { value: PreferredFoot; label: string }[] = [
  { value: 'LEFT', label: '왼발' },
  { value: 'RIGHT', label: '오른발' },
  { value: 'BOTH', label: '양발' },
];

const CAREER_OPTIONS: { value: Career; label: string }[] = [
  { value: 'MIDDLE_SCHOOL', label: '중등부' },
  { value: 'HIGH_SCHOOL', label: '고등부' },
  { value: 'UNIVERSITY', label: '대학부' },
  { value: 'AMATEUR', label: '아마추어' },
  { value: 'ACTIVE', label: '현역' },
];

interface Form {
  preferredPosition?: Position;
  subPosition?: Position;
  height: string;
  weight: string;
  preferredFoot?: PreferredFoot;
  birthDate: string;
  career?: Career;
  yearsOfExperience: string;
}

const toForm = (p: Player): Form => ({
  preferredPosition: p.preferredPosition,
  subPosition: p.subPosition,
  height: p.height?.toString() ?? '',
  weight: p.weight?.toString() ?? '',
  preferredFoot: p.preferredFoot,
  birthDate: p.birthDate ?? '',
  career: p.career,
  yearsOfExperience: p.yearsOfExperience?.toString() ?? '',
});

/** 빈 값은 undefined, 숫자가 아니거나 범위를 벗어나면 에러 메시지 */
function parseIntField(value: string, min: number, max: number, label: string): { value?: number; error?: string } {
  if (value.trim() === '') return {};
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return { error: `${label}은(는) ${min}~${max} 사이로 입력해주세요` };
  return { value: n };
}

const INPUT_CLASS =
  'w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none';

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
        {index}. {title}
      </span>
      <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
  tone = 'cyan',
  disabled,
  title,
  size = 'lg',
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: 'cyan' | 'purple';
  disabled?: boolean;
  title?: string;
  size?: 'sm' | 'lg';
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'border-2 rounded-sm font-black uppercase transition-all',
        size === 'sm' ? 'px-3 py-2 text-[10px] tracking-wider' : 'py-4 text-[11px] tracking-widest',
        disabled
          ? 'border-zinc-800 text-zinc-700 opacity-30 cursor-not-allowed'
          : selected
          ? tone === 'cyan'
            ? 'border-[#00F5FF] bg-[#00F5FF]/10 text-[#00F5FF]'
            : 'border-[#7000FF] bg-[#7000FF]/10 text-[#A970FF]'
          : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
      )}
    >
      {children}
    </button>
  );
}

export default function ProfileEditPage() {
  const router = useRouter();
  const setPlayerId = useTeamStore((s) => s.setPlayerId);

  const [player, setPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Partial<Record<'height' | 'weight' | 'yearsOfExperience', string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    playerApi
      .getMyPlayer()
      .then((res) => {
        setPlayer(res.data);
        setForm(toForm(res.data));
        setPlayerId(res.data.playerId);
      })
      .catch((err) => {
        if (getErrorStatus(err) === 404) {
          toast.info('먼저 선수 등록을 완료해주세요');
          router.replace('/onboarding/register-player');
        } else {
          toast.error('프로필을 불러올 수 없습니다');
        }
      })
      .finally(() => setIsLoading(false));
  }, [router, setPlayerId]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || !form) return;

    const height = parseIntField(form.height, 100, 250, '키');
    const weight = parseIntField(form.weight, 30, 200, '몸무게');
    const years = parseIntField(form.yearsOfExperience, 0, 60, '구력');
    const nextErrors = { height: height.error, weight: weight.error, yearsOfExperience: years.error };
    setErrors(nextErrors);
    if (height.error || weight.error || years.error) return;

    setIsSaving(true);
    try {
      const res = await playerApi.updatePlayer(player.playerId, {
        preferredPosition: form.preferredPosition,
        subPosition: form.subPosition,
        height: height.value,
        weight: weight.value,
        preferredFoot: form.preferredFoot,
        birthDate: form.birthDate || undefined,
        career: form.career,
        yearsOfExperience: years.value,
      });
      setPlayer(res.data);
      setForm(toForm(res.data));
      toast.success('프로필이 수정되었습니다');
      router.back();
    } catch (err) {
      toast.error(getErrorMessage(err, '프로필 수정에 실패했습니다'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col max-w-md mx-auto">
      <main className="flex-grow px-8 pt-12 pb-12 relative">
        <GridBackground />

        <header className="relative z-10 mb-12">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-[3px] bg-[#00F5FF] rounded-full" />
              <p className="text-[11px] font-black text-[#00F5FF] uppercase tracking-widest">Player Profile</p>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-[0.95] mb-4">
            Edit
            <br />
            <span className="accent-gradient-text">Profile</span>
          </h1>
          <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest">
            포지션과 신체 정보를 최신으로 유지하세요.
          </p>
        </header>

        {isLoading || !form ? (
          <div className="relative z-10 flex justify-center py-20">
            {isLoading && (
              <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            {/* 01. Main Position */}
            <section>
              <SectionTitle index="01" title="Main Position" />
              <div className="space-y-4">
                {POSITION_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.positions.map((pos) => (
                        <ChoiceButton
                          key={pos}
                          size="sm"
                          title={POSITION_INFO[pos].description}
                          selected={form.preferredPosition === pos}
                          onClick={() => {
                            set('preferredPosition', pos);
                            if (form.subPosition === pos) set('subPosition', undefined);
                          }}
                        >
                          {pos}
                        </ChoiceButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 02. Sub Position */}
            <section>
              <SectionTitle index="02" title="Sub Position" />
              <div className="space-y-4">
                {POSITION_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.positions.map((pos) => (
                        <ChoiceButton
                          key={pos}
                          size="sm"
                          tone="purple"
                          title={POSITION_INFO[pos].description}
                          disabled={pos === form.preferredPosition}
                          selected={form.subPosition === pos}
                          onClick={() => set('subPosition', pos)}
                        >
                          {pos}
                        </ChoiceButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 03. Physical Data */}
            <section>
              <SectionTitle index="03" title="Physical Data" />
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    { key: 'height', label: 'Height (cm)', placeholder: '175' },
                    { key: 'weight', label: 'Weight (kg)', placeholder: '70' },
                  ] as const
                ).map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className={INPUT_CLASS}
                    />
                    {errors[key] && <p className="text-xs text-red-400 ml-1">{errors[key]}</p>}
                  </div>
                ))}
              </div>
            </section>

            {/* 04. Preferred Foot */}
            <section>
              <SectionTitle index="04" title="Preferred Foot" />
              <div className="grid grid-cols-3 gap-3">
                {PREFERRED_FOOT.map(({ value, label }) => (
                  <ChoiceButton key={value} selected={form.preferredFoot === value} onClick={() => set('preferredFoot', value)}>
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </section>

            {/* 05. Birth Date */}
            <section>
              <SectionTitle index="05" title="Birth Date" />
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => set('birthDate', e.target.value)}
                className={cn(INPUT_CLASS, '[color-scheme:dark]')}
              />
            </section>

            {/* 06. Career */}
            <section>
              <SectionTitle index="06" title="Career" />
              <div className="grid grid-cols-3 gap-3">
                {CAREER_OPTIONS.map(({ value, label }) => (
                  <ChoiceButton key={value} selected={form.career === value} onClick={() => set('career', value)}>
                    {label}
                  </ChoiceButton>
                ))}
              </div>
              <div className="space-y-2 mt-6">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">구력 (년)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="3"
                  value={form.yearsOfExperience}
                  onChange={(e) => set('yearsOfExperience', e.target.value)}
                  className={INPUT_CLASS}
                />
                {errors.yearsOfExperience && <p className="text-xs text-red-400 ml-1">{errors.yearsOfExperience}</p>}
              </div>
            </section>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full accent-gradient text-black font-black py-5 shadow-[0_10px_30px_rgba(0,245,255,0.2)] active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '프로필 저장'}
              </button>
            </div>
          </form>
        )}
      </main>

      <div className="fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F5FF]/30 to-transparent" />
    </div>
  );
}
