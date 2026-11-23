'use client';

import { useEffect } from 'react';
import { getAccessToken } from '@/lib/auth';
import { syncNotifications, handleIncomingNotification } from '@/lib/notificationController';
import {
  startNotificationStream,
  stopNotificationStream,
} from '@/lib/notificationStream';
import { useNotificationStore } from '@/stores/notificationStore';

/**
 * 로그인된 (main) 영역에서 알림을 구독한다. 화면에는 아무것도 그리지 않는다.
 * 1) 초기 목록 sync(카운트/seenIds 세팅) → 2) SSE 구독 시작.
 * sync를 먼저 await 하므로 연결 직후 재전송되는 기존 미읽음 알림은 토스트로 뜨지 않는다.
 */
export default function NotificationProvider() {
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    let active = true;
    (async () => {
      await syncNotifications();
      if (!active) return;
      startNotificationStream(handleIncomingNotification);
    })();

    return () => {
      active = false;
      stopNotificationStream();
      useNotificationStore.getState().reset();
    };
  }, []);

  return null;
}
