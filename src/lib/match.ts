import type { MatchListItem } from '@/types';

/**
 * 경기 진행 상태. BE의 finished는 매니저가 결과를 입력(isFinished=true)해야만 바뀌고,
 * 날짜가 지나도 자동으로 바뀌지 않으므로 날짜와 함께 판단한다.
 * - UPCOMING: 아직 종료 처리 안 됐고 킥오프 시각이 지나지 않음
 * - AWAITING_RESULT: 킥오프 시각이 지났는데 매니저가 아직 결과를 입력하지 않음 → 지난 경기로 분류
 * - FINISHED: 결과 입력(종료 처리) 완료
 */
export type MatchStatus = 'UPCOMING' | 'AWAITING_RESULT' | 'FINISHED';

type MatchLike = Pick<MatchListItem, 'finished' | 'matchDate'>;

export function getMatchStatus(match: MatchLike, now: Date = new Date()): MatchStatus {
  if (match.finished) return 'FINISHED';
  return new Date(match.matchDate) > now ? 'UPCOMING' : 'AWAITING_RESULT';
}

export function isUpcomingMatch(match: MatchLike, now: Date = new Date()) {
  return getMatchStatus(match, now) === 'UPCOMING';
}
