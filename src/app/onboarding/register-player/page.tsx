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

const POSITIONS = ['GK', 'DF', 'MF', 'FW'] as const;
type Position = (typeof POSITIONS)[number];

const POSITION_LABELS: Record<Position, string> = {
  GK: 'GK',
  DF: 'DF',
  MF: 'MF',
  FW: 'FW',
};

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
    defaultValues: { subPositions: [] },
  });

  const mainPosition = watch('mainPosition');
  const subPositions = watch('subPositions') ?? [];

  const toggleSubPosition = (pos: Position) => {
    if (pos === mainPosition) return;
    const current = subPositions;
    const next = current.includes(pos)
      ? current.filter((p) => p !== pos)
      : [...current, pos];
    setValue('subPositions', next);
  };

  const onSubmit = async (data: RegisterPlayerFormData) => {
    setIsLoading(true);
    try {
      const res = await playerApi.registerPlayer(data);
      setPlayerId(res.data.playerId);
      toast.success('선수 등록이 완료되었습니다!');
      router.push('/home');
    } catch (err: unknown) {
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

        {/* Header */}
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
          {/* 01. Basic Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
                01. Basic Identity
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                Player Name
              </label>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                {...register('name')}
                className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none"
              />
              {errors.name && (
                <p className="text-xs text-red-400 ml-1">{errors.name.message}</p>
              )}
            </div>
          </section>

          {/* 02. Squad Number */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
                02. Squad Number
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                Jersey Number (1–99)
              </label>
              <input
                type="number"
                placeholder="10"
                {...register('number', { valueAsNumber: true })}
                className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none"
              />
              {errors.number && (
                <p className="text-xs text-red-400 ml-1">{errors.number.message}</p>
              )}
            </div>
          </section>

          {/* 03. Main Position */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
                03. Main Position
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                Primary Position
              </label>
              <Controller
                name="mainPosition"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-4 gap-3">
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => field.onChange(pos)}
                        className={cn(
                          'py-4 border-2 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all',
                          field.value === pos
                            ? 'border-[#00F5FF] bg-[#00F5FF]/10 text-[#00F5FF]'
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                        )}
                      >
                        {POSITION_LABELS[pos]}
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.mainPosition && (
                <p className="text-xs text-red-400 ml-1">{errors.mainPosition.message}</p>
              )}
            </div>
          </section>

          {/* 04. Sub Positions */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-[0.2em]">
                04. Sub Positions
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-white/[0.02]" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                Secondary Positions (복수 선택 가능)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {POSITIONS.map((pos) => {
                  const isMain = pos === mainPosition;
                  const isSelected = subPositions.includes(pos);
                  return (
                    <button
                      key={pos}
                      type="button"
                      disabled={isMain}
                      onClick={() => toggleSubPosition(pos)}
                      className={cn(
                        'py-4 border-2 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all',
                        isMain
                          ? 'border-zinc-800 text-zinc-700 opacity-30 cursor-not-allowed'
                          : isSelected
                          ? 'border-[#7000FF] bg-[#7000FF]/10 text-[#7000FF]'
                          : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                      )}
                    >
                      {POSITION_LABELS[pos]}
                    </button>
                  );
                })}
              </div>
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
            <p className="text-center mt-6 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
              Next: Team Connection
            </p>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F5FF]/30 to-transparent" />
    </div>
  );
}
