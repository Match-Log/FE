import { apiClient } from './client';

export type NotificationType =
  | 'TODAY_MATCH'
  | 'MATCH_CREATED'
  | 'MATCH_REVIEW_REMINDER'
  | 'PLAYER_JOINED';

// REST(GET /notifications) 응답 아이템 — 읽음 포함 전체를 반환한다.
export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  referenceId: number;
  teamId: number;
  createdAt: string; // "2026-11-23T14:00:00"
}

// SSE(event: notification) 페이로드 — referenceId/teamId를 포함해 자립적이다(라우팅에 바로 사용 가능).
export interface NotificationEvent {
  notificationId: number;
  type: NotificationType;
  title: string;
  body: string;
  referenceId: number;
  teamId: number;
}

export const notificationApi = {
  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/api/v1/notifications/unread-count'),

  // 읽음 포함 전체 알림 목록.
  getNotifications: () =>
    apiClient.get<NotificationItem[]>('/api/v1/notifications'),

  markAsRead: (notificationId: number) =>
    apiClient.patch<void>(`/api/v1/notifications/${notificationId}/read`),

  markAllRead: () =>
    apiClient.patch<void>('/api/v1/notifications/read-all'),
};
