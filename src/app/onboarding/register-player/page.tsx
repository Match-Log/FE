'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { playerApi } from '@/api/player';
import { registerPlayerSchema, type RegisterPlayerFormData } from '@/schemas/player';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { cn } from '@/lib/utils';

const POSITION_GROUPS = [
  { label: 'GK', positions: ['GK'] },
  { label: 'DF', positions: ['CB', 'LB', 'RB', 'WB'] },
  { label: 'MF', positions: ['CDM', 'CM', 'LM', 'RM', 'CAM', 'AM'] },
  { label: 'FW', positions: ['LW', 'RW', 'ST', 'CF'] },
] as const;

type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'WB' | 'CDM' | 'CM' | 'LM' | 'RM' | 'CAM' | 'AM' | 'LW' | 'RW' | 'ST' | 'CF';

const PREFERRED_FOOT = [
  { value: 'LEFT', label: '왼발' },
  { value: 'RIGHT', label: '오른발' },
  { value: 'BOTH', label: '양발' },
] as const;

export default function RegisterPlayerPage() {
  const router = useRouter();
  const { setPlayerId } = useTeamStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterPlayerFormData>({
    resolver: zodResolver(registerPlayerSchema),
  });

  const preferredPosition = watch('preferredPosition');
  const subPosition = watch('subPosition');
  const preferredFoot = watch('preferredFoot');

  const onSubmit = async (data: RegisterPlayerFormData) => {
    console.log('[RegisterPlayer] 제출 데이터:', data);
    setIsLoading(true);
    try {
      const res = await playerApi.registerPlayer({
        birthDate: data.birthDate || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        preferredFoot: data.preferredFoot || undefined,
        career: data.career || undefined,
        preferredPosition: data.preferredPosition || undefined,
        subPosition: data.subPosition || undefined,
      });
      setPlayerId(res.data.playerId);
      toast.success('선수 등록이 완료되었습니다!');
      router.push('/team/select');
    } catch (err: unknown) {
      console.error('[RegisterPlayer] 실패:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || '선수 등록에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col max-w-md mx-auto">
      <main className="flex-grow px-8 pt-12 pb-12 relative">
        <GridBackground />

        <header className="relative z-10 mb-12">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-[3px] bg-[#00F5FF] rounded-full" />
              <p className="text-[11px] font-black text-[#00F5FF] uppercase tracking-widest">
                Identity & Performance Data
              </p>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-[0.95] mb-4">
            Player
            <br />
            <span className="accent-gradient-text">Registration</span>
          </h1>
          <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest">
            선수 정보와 포지션 데이터를 입력하세요.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 relative z-10">

          {/* 01. Main Position */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
                01. Main Position
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
            </div>
            <Controller
              name="preferredPosition"
              control={control}
              render={({ field }) => (
                <div className="space-y-4">
                  {POSITION_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.positions.map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => {
                              field.onChange(field.value === pos ? undefined : pos);
                              if (subPosition === pos) setValue('subPosition', undefined);
                            }}
                            className={cn(
                              'px-3 py-2 border-2 rounded-sm text-[10px] font-black uppercase tracking-wider transition-all',
                              field.value === pos
                                ? 'border-[#00F5FF] bg-[#00F5FF]/10 text-[#00F5FF]'
                                : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                            )}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </section>

          {/* 02. Sub Position */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
                02. Sub Position
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
            </div>
            <div className="space-y-4">
              {POSITION_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.positions.map((pos) => {
                      const isMain = pos === preferredPosition;
                      const isSelected = subPosition === pos;
                      return (
                        <button
                          key={pos}
                          type="button"
                          disabled={isMain}
                          onClick={() => setValue('subPosition', isSelected ? undefined : pos as Position)}
                          className={cn(
                            'px-3 py-2 border-2 rounded-sm text-[10px] font-black uppercase tracking-wider transition-all',
                            isMain
                              ? 'border-zinc-800 text-zinc-700 opacity-30 cursor-not-allowed'
                              : isSelected
                              ? 'border-[#7000FF] bg-[#7000FF]/10 text-[#7000FF]'
                              : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                          )}
                        >
                          {pos}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 03. Physical Data */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
                03. Physical Data
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  placeholder="175"
                  {...register('height')}
                  className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none"
                />
                {errors.height && (
                  <p className="text-xs text-red-400 ml-1">{errors.height.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  placeholder="70"
                  {...register('weight')}
                  className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none"
                />
                {errors.weight && (
                  <p className="text-xs text-red-400 ml-1">{errors.weight.message as string}</p>
                )}
              </div>
            </div>
          </section>

          {/* 04. Preferred Foot */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
                04. Preferred Foot
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PREFERRED_FOOT.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('preferredFoot', preferredFoot === value ? undefined : value)}
                  className={cn(
                    'py-4 border-2 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all',
                    preferredFoot === value
                      ? 'border-[#00F5FF] bg-[#00F5FF]/10 text-[#00F5FF]'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* 05. Birth Date */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
                05. Birth Date
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                생년월일 (선택)
              </label>
              <input
                type="date"
                {...register('birthDate')}
                className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none [color-scheme:dark]"
              />
            </div>
          </section>

          {/* 06. Career */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
                06. Career
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                경력 (선택)
              </label>
              <input
                type="text"
                placeholder="ex) 고등부 주전, 조기축구회 5년"
                {...register('career')}
                className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none"
              />
            </div>
          </section>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full accent-gradient text-black font-black py-5 shadow-[0_10px_30px_rgba(0,245,255,0.2)] active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {isLoading ? '등록 중...' : '선수 등록하기'}
            </button>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F5FF]/30 to-transparent" />
    </div>
  );
}
