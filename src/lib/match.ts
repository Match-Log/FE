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

/**
 * MVP 투표 마감 시각. 경기 날짜(matchDate)가 n일이면 n+1일 23:59:59.999까지.
 * finished 전환 시점이 아니라 경기 날짜 기준이므로 matchDate만 사용한다.
 */
export function getMvpVoteDeadline(matchDate: string): Date {
  const d = new Date(matchDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 2); // n+2일 00:00
  return new Date(d.getTime() - 1); // → n+1일 23:59:59.999
}

export type MvpPhase = 'VOTING' | 'REVIEW';

/**
 * 종료된 경기의 MVP 단계.
 * - VOTING: 마감 전 → "MVP 투표하기"
 * - REVIEW: 마감 후 → "경기 돌아보기"
 * 미종료 경기는 null.
 */
export function getMvpPhase(match: MatchLike, now: Date = new Date()): MvpPhase | null {
  if (!match.finished) return null;
  return now.getTime() <= getMvpVoteDeadline(match.matchDate).getTime() ? 'VOTING' : 'REVIEW';
}
