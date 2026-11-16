import type { MatchListItem } from '@/types';

/**
 * 경기 진행 상태. BE의 finished는 매니저가 결과를 입력(isFinished=true)해야만 바뀌고,
 * 날짜가 지나도 자동으로 바뀌지 않으므로 날짜와 함께 판단한다.
 * - UPCOMING: 아직 종료 처리 안 됐고 경기일이 오늘 이후(오늘 경기는 하루 동안 예정으로 유지, D-Day)
 * - AWAITING_RESULT: 경기일이 지났는데 매니저가 아직 결과를 입력하지 않음 → 지난 경기로 분류
 * - FINISHED: 결과 입력(종료 처리) 완료
 */
export type MatchStatus = 'UPCOMING' | 'AWAITING_RESULT' | 'FINISHED';

type MatchLike = Pick<MatchListItem, 'finished' | 'matchDate'>;

function startOfToday(now: Date) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getMatchStatus(match: MatchLike, now: Date = new Date()): MatchStatus {
  if (match.finished) return 'FINISHED';
  return new Date(match.matchDate) >= startOfToday(now) ? 'UPCOMING' : 'AWAITING_RESULT';
}

export function isUpcomingMatch(match: MatchLike, now: Date = new Date()) {
  return getMatchStatus(match, now) === 'UPCOMING';
}
