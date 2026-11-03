'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pin, PenSquare, MessageSquare } from 'lucide-react';
import { boardApi } from '@/api/board';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { cn } from '@/lib/utils';
import type { BoardPost } from '@/types';

function formatPostDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(d);
}

function getInitials(name: string) {
  return name.slice(0, 2);
}

export default function BoardPage() {
  const { teamId, role } = useTeamStore();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    boardApi.getPosts(teamId)
      .then((r) => setPosts(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [teamId]);

  const pinned = posts.filter((p) => p.isPinned);
  const regular = posts.filter((p) => !p.isPinned);

  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 z-50 bg-[#05060B]/90 backdrop-blur-md border-b border-white/5">
        <h1 className="text-lg font-black tracking-tight">팀 게시판</h1>
        {role === 'MANAGER' && (
          <Link
            href="/board/create"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#00F5FF]"
          >
            <PenSquare className="w-4 h-4" />
          </Link>
        )}
      </header>

      <main className="relative pb-28">
        <GridBackground />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 relative z-10">
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">게시글이 없습니다</p>
            {role === 'MANAGER' && (
              <Link
                href="/board/create"
                className="inline-block mt-6 px-6 py-3 accent-gradient text-black text-xs font-black uppercase tracking-widest rounded-xl"
              >
                + 게시글 작성
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-px relative z-10">
            {/* Pinned posts */}
            {pinned.map((post) => (
              <Link key={post.boardId} href={`/board/${post.boardId}`}>
                <div
                  className="px-6 py-6 border-b border-white/5 border-l-[3px] border-l-[#4FACFE] hover:bg-white/[0.02] transition-colors"
                  style={{
                    background: 'linear-gradient(to right, rgba(79,172,254,0.1), rgba(0,242,254,0.05))',
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-black text-[#00F5FF] bg-cyan-400/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500">{formatPostDate(post.createdAt)}</span>
                  </div>
                  <h2 className="text-base font-black mb-3 tracking-tight leading-relaxed text-white">
                    {post.title}
                  </h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#00F5FF]/20 flex items-center justify-center text-[7px] font-black text-[#00F5FF]">
                        {getInitials(post.authorName)}
                      </div>
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">{post.authorName}</span>
                    </div>
                    {(post.commentCount ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-600">
                        <MessageSquare className="w-3 h-3" /> {post.commentCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {/* Regular posts */}
            {regular.map((post) => (
              <Link key={post.boardId} href={`/board/${post.boardId}`}>
                <div className="px-6 py-5 border-b border-white/5 bg-white/[0.015] hover:bg-white/[0.03] transition-colors backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-zinc-500 bg-white/5 px-2 py-0.5 rounded uppercase tracking-tighter">
                      Notice
                    </span>
                    <span className="text-[10px] font-bold text-zinc-600">{formatPostDate(post.createdAt)}</span>
                  </div>
                  <h2 className="text-sm font-black mb-2 tracking-tight leading-relaxed">{post.title}</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[7px] font-black text-zinc-500">
                        {getInitials(post.authorName)}
                      </div>
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">{post.authorName}</span>
                    </div>
                    {(post.commentCount ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-600">
                        <MessageSquare className="w-3 h-3" /> {post.commentCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
