'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, MapPin, ShieldHalf } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { teamApi } from '@/api/team';
import { createTeamSchema, type CreateTeamFormData } from '@/schemas/team';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';

export default function CreateTeamPage() {
  const router = useRouter();
  const { setTeam } = useTeamStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { matchType: 'SOCCER' },
  });

  const matchType = watch('matchType');

  const onSubmit = async (data: CreateTeamFormData) => {
    setIsLoading(true);
    try {
      const res = await teamApi.createTeam(data);
      const team = res.data;
      setTeam(team.teamId, team.playerId ?? 0, team.role);
      toast.success('팀이 생성되었습니다!');
      router.push('/onboarding/register-player');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || '팀 생성에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col max-w-md mx-auto">
      {/* Nav */}
      <nav className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#05060B]/80 backdrop-blur-md z-30 border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00F5FF]">
          Create New Squad
        </span>
        <div className="w-10" />
      </nav>

      <main className="flex-grow px-6 pt-8 pb-12 relative overflow-hidden">
        <GridBackground />

        {/* Header */}
        <header className="relative z-10 mb-10">
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
            Team
            <br />
            <span className="accent-gradient-text">Creation</span>
          </h1>
          <p className="text-zinc-500 text-xs font-bold leading-relaxed uppercase tracking-tight">
            새로운 팀을 만들고 데이터 분석을 시작하세요.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
          {/* 팀 엠블럼 (UI only) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              Team Emblem
            </label>
            <div className="flex items-center gap-6 p-6 rounded-sm bg-zinc-900/30 border border-white/5">
              <div className="w-20 h-20 rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer group hover:border-[#00F5FF]/50 transition-all">
                <ShieldHalf className="w-6 h-6 text-zinc-700 group-hover:text-[#00F5FF] transition-colors" />
                <span className="text-[8px] font-black text-zinc-600 mt-2 uppercase tracking-tighter">
                  Upload
                </span>
              </div>
              <div className="flex-grow">
                <p className="text-[11px] text-zinc-400 leading-snug">
                  팀을 상징하는 로고를 등록해주세요.
                  <br />
                  <span className="text-[9px] text-zinc-600">Square ratio recommended (PNG, JPG)</span>
                </p>
              </div>
            </div>
          </div>

          {/* 팀명 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              Squad Name
            </label>
            <input
              type="text"
              placeholder="팀 이름을 입력하세요 (예: FC 한강)"
              {...register('name')}
              className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none"
            />
            {errors.name && (
              <p className="text-xs text-red-400 ml-1">{errors.name.message}</p>
            )}
          </div>

          {/* 지역 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              Base Region
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="활동 지역 (예: 서울 마포구)"
                {...register('region')}
                className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none"
              />
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
            </div>
            {errors.region && (
              <p className="text-xs text-red-400 ml-1">{errors.region.message}</p>
            )}
          </div>

          {/* 매치 타입 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              Match Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['SOCCER', 'FUTSAL'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('matchType', type)}
                  className={
                    matchType === type
                      ? 'py-4 border-2 border-[#00F5FF] bg-[#00F5FF]/10 text-[#00F5FF] rounded-sm text-[11px] font-black uppercase tracking-widest transition-all'
                      : 'py-4 border-2 border-zinc-800 rounded-sm text-[11px] font-black uppercase tracking-widest hover:border-zinc-600 transition-all text-zinc-400'
                  }
                >
                  {type === 'SOCCER' ? '⚽ Soccer' : '🏟 Futsal'}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full accent-gradient text-black font-black py-5 shadow-[0_10px_30px_rgba(0,245,255,0.2)] active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {isLoading ? '생성 중...' : 'Initialize Squad'}
            </button>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F5FF]/30 to-transparent" />
    </div>
  );
}
