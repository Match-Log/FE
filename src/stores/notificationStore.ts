import { create } from 'zustand';
import type { NotificationItem } from '@/api/notifications';

interface NotificationState {
  // 읽음 포함 전체 알림(모든 팀). 뱃지/패널은 현재 팀 기준으로 필터링해 파생한다.
  items: NotificationItem[];
  // 재연결 시 서버가 미읽음 알림을 모두 재push하므로 notificationId 기준으로 중복 수신을 걸러낸다.
  seenIds: Set<number>;

  // 초기 sync(목록 조회) 결과로 전체 상태를 세팅한다.
  setFromList: (items: NotificationItem[]) => void;
  // SSE로 들어온 새 알림 1건을 목록 맨 앞에 추가한다(이미 본 id면 무시).
  addItem: (item: NotificationItem) => void;
  hasSeen: (id: number) => boolean;
  // 단건 읽음: 목록에서 제거하지 않고 isRead만 true로 전환한다.
  markRead: (id: number) => void;
  // 전체 읽음.
  markAllRead: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  seenIds: new Set<number>(),

  setFromList: (items) =>
    set({
      items,
      seenIds: new Set(items.map((i) => i.id)),
    }),

  addItem: (item) =>
    set((s) => {
      if (s.seenIds.has(item.id)) return s;
      const seenIds = new Set(s.seenIds);
      seenIds.add(item.id);
      return { items: [item, ...s.items], seenIds };
    }),

  hasSeen: (id) => get().seenIds.has(id),

  markRead: (id) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, isRead: true } : i)),
    })),

  markAllRead: () =>
    set((s) => ({
      items: s.items.map((i) => ({ ...i, isRead: true })),
    })),

  reset: () => set({ items: [], seenIds: new Set<number>() }),
}));
