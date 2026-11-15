'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { matchApi } from '@/api/match';
import { voteApi } from '@/api/vote';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import TacticView from '@/components/match/TacticView';
import FeedbackView from '@/components/match/FeedbackView';
import { Spinner } from '@/components/match/shared';
import type { Match, VoteItem } from '@/types';

// 탭 하나를 경기 상태에 따라 나눠 쓴다: 종료 전 → 전술(Tactic), 종료 후 → 피드백(Feedback).
// 탭 라벨 전환은 matches/[matchId]/layout.tsx에서 match.finished로 처리한다.
export default function MatchTacticFeedbackPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const { playerId, role } = useTeamStore();
  const isManager = role === 'MANAGER';

  const [match, setMatch] = useState<Match | null>(null);
  const [attendees, setAttendees] = useState<VoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;
    Promise.all([
      matchApi.getMatch(matchId),
      // 개인 전술·피드백은 참석(ATTEND) 선수에게만 작성 가능
      voteApi.getVotes(matchId).then((r) => r.data.votes).catch(() => [] as VoteItem[]),
    ])
      .then(([m, votes]) => {
        setMatch(m.data);
        setAttendees(votes.filter((v) => v.status === 'ATTEND'));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [matchId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">경기 정보를 불러올 수 없습니다</p>
      </div>
    );
  }

  const props = { matchId, isManager, myPlayerId: playerId, attendees };

  return (
    <div className="relative">
      <GridBackground />
      {match.finished ? <FeedbackView {...props} /> : <TacticView {...props} />}
    </div>
  );
}
