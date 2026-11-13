'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, MapPin, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { matchApi } from '@/api/match';
import { useTeamStore } from '@/stores/teamStore';
import { cn } from '@/lib/utils';

const createMatchSchema = z.object({
  matchType: z.enum(['SOCCER', 'FOOTBALL']),
  opponent: z.string().min(2, '상대 팀 이름을 입력해주세요'),
  matchDate: z.string().min(1, '날짜를 선택해주세요'),
  matchTime: z.string().min(1, '시간을 선택해주세요'),
  homeAway: z.enum(['HOME', 'AWAY']),
  location: z.string().min(2, '장소를 입력해주세요'),
  memo: z.string().max(500, '메모는 500자 이내로 입력해주세요').optional(),
});

type CreateMatchForm = z.infer<typeof createMatchSchema>;

export default function CreateMatchPage() {
  const router = useRouter();
  const { teamId, role } = useTeamStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateMatchForm>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      matchType: 'SOCCER',
      homeAway: 'HOME',
    },
  });

  if (role !== 'MANAGER') {
    router.push('/schedule');
    return null;
  }

  const onSubmit = async (data: CreateMatchForm) => {
    if (!teamId) return;
    setIsLoading(true);
    try {
      const matchDate = `${data.matchDate}T${data.matchTime}:00`;
      await matchApi.createMatch(teamId, {
        matchType: data.matchType,
        opponent: data.opponent,
        matchDate,
        homeAway: data.homeAway,
        location: data.location,
        memo: data.memo || undefined,
      });
      toast.success('경기가 생성되었습니다');
      router.push('/schedule');
    } catch {
      toast.error('경기 생성에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 flex items-center gap-4 sticky top-0 bg-[#05060B]/90 backdrop-blur-md border-b border-white/5 z-50">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-black uppercase tracking-tight">경기 생성</h1>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Schedule a Match</p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="px-5 pt-6 pb-32 space-y-8">
        {/* Match Type */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">
            Match Type
          </label>
          <Controller
            name="matchType"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {(['SOCCER', 'FOOTBALL'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => field.onChange(type)}
                    className={cn(
                      'py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-all',
                      field.value === type
                        ? 'border-[#00F5FF]/40 bg-[#00F5FF]/10 text-[#00F5FF]'
                        : 'border-white/5 bg-white/[0.02] text-zinc-600'
                    )}
                  >
                    {type === 'SOCCER' ? '축구' : '풋살'}
                  </button>
                ))}
              </div>
            )}
          />
        </section>

        {/* Home / Away */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">
            Home / Away
          </label>
          <Controller
            name="homeAway"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {(['HOME', 'AWAY'] as const).map((ha) => (
                  <button
                    key={ha}
                    type="button"
                    onClick={() => field.onChange(ha)}
                    className={cn(
                      'py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-all',
                      field.value === ha
                        ? ha === 'HOME'
                          ? 'border-[#00F5FF]/40 bg-[#00F5FF]/10 text-[#00F5FF]'
                          : 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                        : 'border-white/5 bg-white/[0.02] text-zinc-600'
                    )}
                  >
                    {ha === 'HOME' ? 'Home' : 'Away'}
                  </button>
                ))}
              </div>
            )}
          />
        </section>

        {/* Opponent */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">
            상대 팀
          </label>
          <input
            {...register('opponent')}
            placeholder="상대 팀 이름"
            className={cn(
              'w-full bg-white/[0.03] border rounded-xl px-4 py-4 text-sm font-semibold placeholder-zinc-700 outline-none focus:border-[#00F5FF]/40 transition-colors',
              errors.opponent ? 'border-red-500/50' : 'border-white/5'
            )}
          />
          {errors.opponent && (
            <p className="text-red-400 text-[10px] font-bold">{errors.opponent.message}</p>
          )}
        </section>

        {/* Date & Time */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">
            일정
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
              <input
                type="date"
                {...register('matchDate')}
                className={cn(
                  'w-full bg-white/[0.03] border rounded-xl pl-11 pr-4 py-4 text-sm font-semibold placeholder-zinc-700 outline-none focus:border-[#00F5FF]/40 transition-colors text-white [color-scheme:dark]',
                  errors.matchDate ? 'border-red-500/50' : 'border-white/5'
                )}
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
              <input
                type="time"
                {...register('matchTime')}
                className={cn(
                  'w-full bg-white/[0.03] border rounded-xl pl-11 pr-4 py-4 text-sm font-semibold placeholder-zinc-700 outline-none focus:border-[#00F5FF]/40 transition-colors text-white [color-scheme:dark]',
                  errors.matchTime ? 'border-red-500/50' : 'border-white/5'
                )}
              />
            </div>
          </div>
          {(errors.matchDate || errors.matchTime) && (
            <p className="text-red-400 text-[10px] font-bold">날짜와 시간을 입력해주세요</p>
          )}
        </section>

        {/* Location */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">
            경기 장소
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
            <input
              {...register('location')}
              placeholder="경기장 이름 또는 주소"
              className={cn(
                'w-full bg-white/[0.03] border rounded-xl pl-11 pr-4 py-4 text-sm font-semibold placeholder-zinc-700 outline-none focus:border-[#00F5FF]/40 transition-colors',
                errors.location ? 'border-red-500/50' : 'border-white/5'
              )}
            />
          </div>
          {errors.location && (
            <p className="text-red-400 text-[10px] font-bold">{errors.location.message}</p>
          )}
        </section>

        {/* Memo */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">
            메모 (선택)
          </label>
          <textarea
            {...register('memo')}
            rows={3}
            maxLength={500}
            placeholder="경기 관련 메모 (최대 500자)"
            className={cn(
              'w-full bg-white/[0.03] border rounded-xl px-4 py-4 text-sm font-semibold placeholder-zinc-700 outline-none focus:border-[#00F5FF]/40 transition-colors resize-none',
              errors.memo ? 'border-red-500/50' : 'border-white/5'
            )}
          />
          {errors.memo && (
            <p className="text-red-400 text-[10px] font-bold">{errors.memo.message}</p>
          )}
        </section>

        {/* Submit */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-8 pt-4 bg-[#05060B]/90 backdrop-blur-md">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] accent-gradient text-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                생성 중...
              </span>
            ) : (
              '경기 생성하기'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
