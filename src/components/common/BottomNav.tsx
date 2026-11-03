'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/squad', icon: Users, label: 'Squad' },
  { href: '/board', icon: MessageSquare, label: 'Board' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0A0B14]/90 backdrop-blur-xl border-t border-white/5 px-4 py-3 z-50">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 transition-colors',
                isActive ? 'text-[#00F5FF]' : 'text-zinc-600 hover:text-zinc-400'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
