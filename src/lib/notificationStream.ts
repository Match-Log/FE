import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getAccessToken } from '@/lib/auth';
import { reissueToken } from '@/api/reissue';
import type { NotificationEvent } from '@/api/notifications';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const SUBSCRIBE_URL = `${API_BASE}/api/v1/notifications/subscribe`;
const RETRY_DELAY_MS = 3000;

// 401(토큰 만료) 응답을 일반 에러와 구분하기 위한 마커.
class UnauthorizedError extends Error {}

let aborter: AbortController | null = null;
let running = false;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * SSE 구독을 시작한다. 로그인 1회당 1번만 호출(중복 호출은 무시).
 *
 * 재연결 전략:
 * - fetchEventSource의 내부 자동 재시도는 쓰지 않는다(onerror에서 throw해서 끊는다).
 *   내부 재시도는 최초 headers를 재사용하므로 재발급된 새 토큰을 못 싣기 때문.
 * - 대신 while 루프에서 매 연결마다 getAccessToken()으로 최신 토큰을 헤더에 싣는다.
 * - 401이면 reissueToken() 후 즉시 재연결, 그 외 에러는 백오프 후 재연결.
 */
export function startNotificationStream(
  onNotification: (payload: NotificationEvent) => void
) {
  if (running) return;
  running = true;
  void run(onNotification);
}

export function stopNotificationStream() {
  running = false;
  aborter?.abort();
  aborter = null;
}

async function run(onNotification: (payload: NotificationEvent) => void) {
  while (running) {
    const token = getAccessToken();
    if (!token) {
      running = false;
      return;
    }

    aborter = new AbortController();
    try {
      await fetchEventSource(SUBSCRIBE_URL, {
        signal: aborter.signal,
        // 탭이 백그라운드로 가도 연결을 유지한다(기본값은 숨겨지면 연결을 끊음).
        openWhenHidden: true,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        async onopen(res) {
          if (res.ok) return;
          if (res.status === 401) throw new UnauthorizedError();
          throw new Error(`SSE 연결 실패: ${res.status}`);
        },
        onmessage(ev) {
          // event: connect / event: notification 중 notification만 처리.
          if (ev.event !== 'notification' || !ev.data) return;
          try {
            onNotification(JSON.parse(ev.data) as NotificationEvent);
          } catch {
            // 파싱 실패 알림은 무시.
          }
        },
        onerror(err) {
          // throw해서 fetchEventSource의 내부 재시도를 끊고, 재연결은 while 루프가 담당한다.
          throw err;
        },
      });
      // 서버가 정상 종료(스트림 close)한 경우: 루프가 아래 백오프 후 재연결한다.
    } catch (err) {
      if (!running || aborter?.signal.aborted) return;

      if (err instanceof UnauthorizedError) {
        try {
          await reissueToken();
          continue; // 새 토큰으로 즉시 재연결
        } catch {
          // 재발급 실패 → 구독 중단. 이후 다른 API 호출의 401 처리에서 로그인으로 리다이렉트된다.
          running = false;
          return;
        }
      }
    }

    await delay(RETRY_DELAY_MS);
  }
}
