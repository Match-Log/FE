'use client';

import { BarChart2 } from 'lucide-react';
import { useTeamStore } from '@/stores/teamStore';

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { role } = useTeamStore();

  return (
    <header className="px-6 py-5 flex items-center justify-between sticky top-0 bg-[#05060B]/80 backdrop-blur-md z-30 border-b border-white/5">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-[#00F5FF]" />
        <span className="text-xl font-black italic uppercase tracking-tighter">
          Match<span className="text-[#00F5FF]">Log</span>
        </span>
      </div>
      {title && (
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00F5FF]">
          {title}
        </span>
      )}
      {role === 'MANAGER' && (
        <span className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[9px] font-black uppercase tracking-tighter">
          Manager
        </span>
      )}
    </header>
  );
}
