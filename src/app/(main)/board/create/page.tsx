'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { boardApi } from '@/api/board';
import { useTeamStore } from '@/stores/teamStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  title: z.string().min(1, { error: '제목을 입력해주세요' }).max(100),
  content: z.string().min(1, { error: '내용을 입력해주세요' }),
});
type FormData = z.infer<typeof schema>;

export default function BoardCreatePage() {
  const router = useRouter();
  const { teamId, role } = useTeamStore();

  useEffect(() => {
    if (role !== 'MANAGER') router.replace('/home');
  }, [role, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!teamId) return;
    try {
      const res = await boardApi.createPost({ ...data, teamId });
      toast.success('게시글이 등록되었습니다');
      router.replace(`/board/${res.data.boardId}`);
    } catch {
      toast.error('게시글 등록에 실패했습니다');
    }
  };

  if (role !== 'MANAGER') return null;

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col">
      {/* Header */}
      <header className="px-4 pt-8 pb-4 flex items-center gap-4 sticky top-0 z-50 bg-[#05060B]/90 backdrop-blur-md border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-black tracking-tight">게시글 작성</h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 px-6 pt-6 pb-10 gap-6">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2">
            제목
          </label>
          <Input
            {...register('title')}
            placeholder="제목을 입력하세요"
            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-[#00F5FF]/50 h-11 text-sm font-bold"
          />
          {errors.title && (
            <p className="text-red-400 text-[10px] mt-1 font-bold">{errors.title.message}</p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2">
            내용
          </label>
          <textarea
            {...register('content')}
            placeholder="내용을 입력하세요"
            className="flex-1 min-h-[300px] w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00F5FF]/50 resize-none leading-relaxed"
          />
          {errors.content && (
            <p className="text-red-400 text-[10px] mt-1 font-bold">{errors.content.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 accent-gradient text-black text-sm font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" /> 게시글 등록
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
