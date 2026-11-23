import { toast } from 'sonner';
import { notificationApi } from '@/api/notifications';
import type { NotificationEvent, NotificationItem } from '@/api/notifications';
import { useNotificationStore } from '@/stores/notificationStore';

/**
 * 서버의 전체 알림 목록(읽음 포함)을 가져와 스토어를 최신화한다.
 * - seenIds의 기준점(source of truth).
 * - SSE 구독을 시작하기 "전에" 한 번 호출해 두면, 연결 직후 서버가 재push하는
 *   기존 미읽음 알림이 모두 seenIds에 들어가 있어 토스트가 중복으로 뜨지 않는다.
 */
export async function syncNotifications(): Promise<void> {
  try {
    const { data } = await notificationApi.getNotifications();
    useNotificationStore.getState().setFromList(data);
  } catch {
    // 초기 동기화 실패는 조용히 무시(SSE/다음 호출에서 복구).
  }
}

/**
 * SSE로 수신한 알림 1건을 처리한다.
 * - 이미 본 id면(재연결 재push 등) 무시.
 * - 새 id면 스토어에 추가하고 토스트를 띄운다.
 *   페이로드에 referenceId/teamId가 포함돼 자립적이므로 목록 재조회가 필요 없다.
 *   (createdAt은 페이로드에 없어 수신 시각으로 채운다)
 */
export function handleIncomingNotification(payload: NotificationEvent): void {
  const store = useNotificationStore.getState();
  if (store.hasSeen(payload.notificationId)) return;

  const item: NotificationItem = {
    id: payload.notificationId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    referenceId: payload.referenceId,
    teamId: payload.teamId,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  store.addItem(item);
  toast(payload.title, { description: payload.body });
}

/** 단건 읽음 처리: isRead만 true로 전환(목록에서 사라지지 않음). */
export async function readNotification(id: number): Promise<void> {
  useNotificationStore.getState().markRead(id);
  try {
    await notificationApi.markAsRead(id);
  } catch {
    // 실패 시 다음 sync에서 다시 반영된다.
  }
}

/** 전체 읽음 처리. */
export async function readAllNotifications(): Promise<void> {
  const { items, markAllRead } = useNotificationStore.getState();
  if (items.every((i) => i.isRead)) return;
  markAllRead();
  try {
    await notificationApi.markAllRead();
  } catch {
    // 실패 시 다음 sync에서 다시 반영된다.
  }
}

/**
 * 알림 타입별 이동 경로(우리 App Router 기준).
 * BE 예시는 /teams/{teamId}/matches/{id} 형태지만, 우리 라우트는 현재 팀 컨텍스트 기반
 * 단일 경로(/matches/[matchId], /squad)이므로 teamId는 경로에 쓰지 않는다.
 * 패널은 현재 팀 알림만 노출하므로 클릭 시점의 teamId는 항상 현재 팀과 같다.
 */
export function notificationHref(item: NotificationItem): string | null {
  switch (item.type) {
    case 'TODAY_MATCH':
    case 'MATCH_CREATED':
    case 'MATCH_REVIEW_REMINDER':
      return `/matches/${item.referenceId}`;
    case 'PLAYER_JOINED':
      return '/squad';
    default:
      return null;
  }
}
