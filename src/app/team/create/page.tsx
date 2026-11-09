'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, ChevronLeft, Landmark, MapPin, ShieldHalf } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { teamApi } from '@/api/team';
import { createTeamSchema, type CreateTeamFormData, type CreateTeamFormInput } from '@/schemas/team';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';

export default function CreateTeamPage() {
  const router = useRouter();
  const { playerId, setTeam } = useTeamStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateTeamFormInput, unknown, CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
  });

  const teamImageUrl = watch('teamImage');
  const [previewError, setPreviewError] = useState(false);
  const showPreview = typeof teamImageUrl === 'string' && teamImageUrl.trim() !== '' && !previewError;

  const onSubmit = async (data: CreateTeamFormData) => {
    setIsLoading(true);
    try {
      const res = await teamApi.createTeam(data);
      const team = res.data;
      setTeam(team.teamId, playerId ?? 0, 'MANAGER', team.name);
      toast.success('팀이 생성되었습니다!');
      router.push('/home');
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
          {/* 팀 엠블럼 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              Team Emblem
            </label>
            <div className="flex items-center gap-6 p-6 rounded-sm bg-zinc-900/30 border border-white/5">
              <div className="w-20 h-20 shrink-0 rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center overflow-hidden">
                {showPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={teamImageUrl}
                    alt="팀 로고 미리보기"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <>
                    <ShieldHalf className="w-6 h-6 text-zinc-700" />
                    <span className="text-[8px] font-black text-zinc-600 mt-2 uppercase tracking-tighter">
                      Preview
                    </span>
                  </>
                )}
              </div>
              <div className="flex-grow min-w-0 space-y-2">
                <p className="text-[11px] text-zinc-400 leading-snug">
                  팀을 상징하는 로고 이미지 URL을 입력해주세요.
                  <br />
                  <span className="text-[9px] text-zinc-600">Square ratio recommended (PNG, JPG)</span>
                </p>
                <input
                  type="url"
                  placeholder="https://..."
                  {...register('teamImage', { onChange: () => setPreviewError(false) })}
                  className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-2 px-3 text-xs text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none"
                />
              </div>
            </div>
            {errors.teamImage && (
              <p className="text-xs text-red-400 ml-1">{errors.teamImage.message}</p>
            )}
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

          {/* 창단 연도 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              Founded Year
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                placeholder="창단 연도 (예: 2020)"
                {...register('foundedYear')}
                className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
            </div>
            {errors.foundedYear && (
              <p className="text-xs text-red-400 ml-1">{errors.foundedYear.message}</p>
            )}
          </div>

          {/* 홈 구장 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              Home Ground
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="홈 구장 (예: 망원한강공원 축구장)"
                {...register('homeGround')}
                className="w-full bg-zinc-900/50 border-0 border-b-2 border-b-zinc-800 py-4 px-4 text-sm text-white placeholder-zinc-600 focus:border-b-[#00F5FF] transition-all outline-none"
              />
              <Landmark className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
            </div>
            {errors.homeGround && (
              <p className="text-xs text-red-400 ml-1">{errors.homeGround.message}</p>
            )}
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
