'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Share2 } from 'lucide-react';
import { matchApi } from '@/api/match';
import { cn } from '@/lib/utils';
import { useTeamStore } from '@/stores/teamStore';
import type { Match } from '@/types';

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ matchId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { teamName } = useTeamStore();
  const [match, setMatch] = useState<Match | null>(null);

  const matchId = Number(params.matchId);
  const base = `/matches/${matchId}`;

  const TABS = [
    { label: 'Information', path: '' },
    { label: 'Formation', path: '/formation' },
    { label: match?.finished ? 'Feedback' : 'Tactic', path: '/feedback' },
  ];

  useEffect(() => {
    if (!matchId) return;
    matchApi.getMatch(matchId).then((res) => setMatch(res.data)).catch(() => {});
  }, [matchId]);

  const activeTab = TABS.findIndex((t) => {
    const full = base + t.path;
    return t.path === '' ? pathname === base : pathname.startsWith(full);
  });

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'MatchLog', url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-[#05060B]/90 backdrop-blur-md border-b border-white/5">
        <div className="px-5 pt-8 pb-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            {match ? (
              <>
                <p className="text-xs font-black uppercase tracking-widest">
                  {teamName ?? 'My Team'}{' '}
                  <span className="text-zinc-600 font-bold">VS</span>{' '}
                  {match.opponent}
                </p>
                <p className="text-[9px] font-bold text-zinc-600 mt-0.5 uppercase tracking-widest">
                  {new Intl.DateTimeFormat('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                  }).format(new Date(match.matchDate))}
                </p>
              </>
            ) : (
              <div className="w-32 h-4 bg-white/5 rounded animate-pulse" />
            )}
          </div>

          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-t border-white/5">
          {TABS.map((tab, i) => {
            const href = base + tab.path;
            const isActive = i === activeTab;
            return (
              <Link
                key={tab.label}
                href={href}
                className={cn(
                  'flex-1 py-3.5 text-center text-[10px] font-black uppercase tracking-widest transition-all',
                  isActive ? 'text-white border-b-2 border-[#00F5FF]' : 'text-zinc-600 border-b-2 border-transparent'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  );
}
