'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useTeamStore } from '@/stores/teamStore';
import {
  readAllNotifications,
  readNotification,
  notificationHref,
} from '@/lib/notificationController';
import type { NotificationItem } from '@/api/notifications';
import { cn } from '@/lib/utils';

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export default function NotificationBell() {
  const router = useRouter();
  const items = useNotificationStore((s) => s.items);
  const currentTeamId = useTeamStore((s) => s.teamId);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 현재 팀 알림만 노출(유저가 여러 팀에 소속될 수 있으므로 teamId로 필터링).
  const teamItems = useMemo(
    () => items.filter((i) => i.teamId === currentTeamId),
    [items, currentTeamId]
  );
  const unreadCount = useMemo(
    () => teamItems.filter((i) => !i.isRead).length,
    [teamItems]
  );

  function handleItemClick(item: NotificationItem) {
    setOpen(false);
    void readNotification(item.id);
    const href = notificationHref(item);
    if (href) router.push(href);
  }

  // 바깥 클릭 시 닫기.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="알림"
        className="w-10 h-10 flex items-center justify-center relative bg-[#111218] border border-white/5 rounded-xl hover:border-[#00F5FF]/30 transition-colors"
      >
        <Bell className="w-4 h-4 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white bg-purple-500 rounded-full border-2 border-[#05060B]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-[#111218] border border-white/10 rounded-xl shadow-xl z-50">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              알림
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void readAllNotifications()}
                className="text-[10px] font-bold text-[#00F5FF] hover:underline"
              >
                모두 읽음
              </button>
            )}
          </div>

          {teamItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-zinc-500">
              알림이 없습니다
            </div>
          ) : (
            <ul>
              {teamItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors',
                      !item.isRead && 'bg-white/[0.03]'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {!item.isRead && (
                        <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-sm font-bold truncate',
                          item.isRead ? 'text-zinc-400' : 'text-white'
                        )}
                      >
                        {item.title}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                      {item.body}
                    </p>
                    {item.createdAt && (
                      <p className="mt-1 text-[10px] text-zinc-600">
                        {formatTime(item.createdAt)}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
