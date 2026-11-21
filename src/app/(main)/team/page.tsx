'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Calendar,
  MessageSquare,
  Crown,
  Trophy,
  Users,
  Shield,
  UserRound,
  Repeat,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { cn } from '@/lib/utils';

type MenuItem = {
  label: string;
  desc?: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  managerOnly?: boolean;
  danger?: boolean;
};

export default function TeamHubPage() {
  const { teamName, role, playerId } = useTeamStore();
  const isManager = role === 'MANAGER';

  // 내 프로필: 등록된 선수면 내 선수 상세, 아니면 프로필 수정으로.
  const myProfileHref = playerId != null ? `/squad/${playerId}` : '/profile/edit';

  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: '팀 활동',
      items: [
        { label: '경기 일정', desc: '예정·지난 경기', icon: Calendar, href: '/schedule' },
        { label: '게시판', desc: '공지·소통', icon: MessageSquare, href: '/board' },
        { label: '전담 역할', desc: '주장·세트피스', icon: Crown, href: '/squad/specialists' },
        { label: '선수 순위', desc: '골·도움·선방', icon: Trophy, href: '/squad/ranking' },
      ],
    },
    {
      title: '우리 팀',
      items: [
        { label: '팀원 목록', desc: '선수단', icon: Users, href: '/squad' },
        { label: '팀 프로필', desc: '팀 정보', icon: Shield, href: '/team/settings' },
        { label: '내 프로필', desc: '내 선수 정보', icon: UserRound, href: myProfileHref },
      ],
    },
    {
      title: '팀 참여',
      items: [
        { label: '팀 전환', desc: '다른 팀으로', icon: Repeat, href: '/team/select' },
        { label: '팀 설정', desc: '역할·팀 관리', icon: Settings, href: '/team/settings', managerOnly: true },
        {
          label: '팀 탈퇴',
          icon: LogOut,
          danger: true,
          onClick: () => toast.info('팀 탈퇴 기능은 준비 중입니다'),
        },
      ],
    },
  ];

  const renderItem = (item: MenuItem) => {
    const Icon = item.icon;
    const inner = (
      <div className="flex flex-col gap-3 p-4 h-full">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center border',
            item.danger
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-[#00F5FF]/5 border-[#00F5FF]/15'
          )}
        >
          <Icon className={cn('w-4 h-4', item.danger ? 'text-red-400' : 'text-[#00F5FF]')} />
        </div>
        <div className="min-w-0">
          <p className={cn('text-sm font-black', item.danger ? 'text-red-400' : 'text-white')}>
            {item.label}
          </p>
          {item.desc && (
            <p className="text-[10px] font-bold text-zinc-600 mt-0.5 truncate">{item.desc}</p>
          )}
        </div>
      </div>
    );

    const className =
      'block rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors active:scale-[0.99]';

    if (item.href) {
      return (
        <Link key={item.label} href={item.href} className={className}>
          {inner}
        </Link>
      );
    }
    return (
      <button key={item.label} type="button" onClick={item.onClick} className={cn(className, 'w-full text-left')}>
        {inner}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-[#05060B]/80 backdrop-blur-md z-40 border-b border-white/5">
        <Link
          href="/home"
          aria-label="홈으로"
          className="w-11 h-11 flex items-center justify-center bg-[#111218] border border-white/5 rounded-xl"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-400" />
        </Link>
        <div className="text-center">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Team</p>
          <h1 className="text-base font-black uppercase tracking-[0.15em]">팀 관리</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="px-6 pt-8 pb-28 relative space-y-8">
        <GridBackground />

        {teamName && (
          <p className="relative z-10 text-xl font-black tracking-tight italic uppercase">{teamName}</p>
        )}

        {sections.map((section) => {
          const items = section.items.filter((it) => !it.managerOnly || isManager);
          if (items.length === 0) return null;
          return (
            <section key={section.title} className="relative z-10">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-1">
                {section.title}
              </p>
              <div className="grid grid-cols-2 gap-2">{items.map(renderItem)}</div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
