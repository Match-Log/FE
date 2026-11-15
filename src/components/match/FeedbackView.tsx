'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, EyeOff, MessageSquareText, Pencil, Plus, Sparkles, ThumbsUp, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { feedbackApi } from '@/api/feedback';
import { tacticApi } from '@/api/tactic';
import { cn, getErrorMessage, nullIfNotFound } from '@/lib/utils';
import { FEEDBACK_TAG_PRESETS, normalizeTag } from '@/constants/tactic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Feedback, SavePersonalFeedbackRequest, Tactic, VoteItem } from '@/types';
import {
  Avatar,
  EmptyState,
  GhostButton,
  RatingRing,
  SectionCard,
  Spinner,
  TagChip,
  TextArea,
  ToggleRow,
  formatUpdatedAt,
  ratingColor,
} from './shared';
import { TacticPitch } from './TacticPitch';

interface Props {
  matchId: number;
  isManager: boolean;
  myPlayerId: number | null;
  attendees: VoteItem[];
}

const EMPTY_DRAFT: Required<SavePersonalFeedbackRequest> = {
  content: '',
  rating: null,
  pros: '',
  cons: '',
  tags: [],
  isVisible: true,
};

export default function FeedbackView({ matchId, isManager, myPlayerId, attendees }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [teamFeedback, setTeamFeedback] = useState<Feedback | null>(null);
  const [myFeedback, setMyFeedback] = useState<Feedback | null>(null);
  const [allFeedbacks, setAllFeedbacks] = useState<Feedback[]>([]);
  const [tactic, setTactic] = useState<Tactic | null>(null);
  const [showTactic, setShowTactic] = useState(false);

  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [teamDraft, setTeamDraft] = useState('');
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  const [target, setTarget] = useState<VoteItem | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [customTag, setCustomTag] = useState('');
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  useEffect(() => {
    const safe = <T,>(p: Promise<T | null>) => p.catch(() => null);
    Promise.all([
      safe(nullIfNotFound(feedbackApi.getTeamFeedback(matchId))),
      // 매니저는 전체 목록에서 보고, 선수는 본인 것만 조회(비공개면 404 → null)
      isManager || myPlayerId == null ? Promise.resolve(null) : safe(nullIfNotFound(feedbackApi.getFeedback(matchId, myPlayerId))),
      isManager ? feedbackApi.getAllPersonalFeedbacks(matchId).then((r) => r.data).catch(() => [] as Feedback[]) : Promise.resolve([] as Feedback[]),
      safe(nullIfNotFound(tacticApi.getTeamTactic(matchId))),
    ])
      .then(([team, mine, all, t]) => {
        setTeamFeedback(team);
        setMyFeedback(mine);
        setAllFeedbacks(all);
        setTactic(t);
      })
      .finally(() => setIsLoading(false));
  }, [matchId, isManager, myPlayerId]);

  // ── Team feedback ──
  const saveTeam = async () => {
    const content = teamDraft.trim();
    if (!content) {
      toast.error('팀 피드백 내용을 입력해주세요');
      return;
    }
    setIsSavingTeam(true);
    try {
      const res = await feedbackApi.saveTeamFeedback(matchId, content);
      setTeamFeedback(res.data);
      setIsEditingTeam(false);
      toast.success('팀 피드백이 저장되었습니다');
    } catch (err) {
      toast.error(getErrorMessage(err, '저장에 실패했습니다'));
    } finally {
      setIsSavingTeam(false);
    }
  };

  // ── Personal feedback (manager) ──
  const feedbackOf = (playerId: number) => allFeedbacks.find((f) => f.playerId === playerId);
  const written = attendees.filter((a) => feedbackOf(a.playerId));
  const ratings = allFeedbacks.map((f) => f.rating).filter((r): r is number => r != null);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;

  const openEditor = (v: VoteItem) => {
    const f = feedbackOf(v.playerId);
    setDraft({
      content: f?.content ?? '',
      rating: f?.rating ?? null,
      pros: f?.pros ?? '',
      cons: f?.cons ?? '',
      tags: f?.tags ?? [],
      isVisible: f?.isVisible ?? true,
    });
    setCustomTag('');
    setTarget(v);
  };

  const toggleTag = (tag: string) =>
    setDraft((d) => ({ ...d, tags: d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag] }));

  const addCustomTag = () => {
    const tag = normalizeTag(customTag);
    if (tag && !draft.tags.includes(tag)) setDraft((d) => ({ ...d, tags: [...d.tags, tag] }));
    setCustomTag('');
  };

  const savePersonal = async () => {
    if (!target) return;
    setIsSavingPersonal(true);
    try {
      const res = await feedbackApi.savePersonalFeedback(matchId, target.playerId, {
        content: draft.content?.trim() || null,
        rating: draft.rating,
        pros: draft.pros?.trim() || null,
        cons: draft.cons?.trim() || null,
        tags: draft.tags,
        isVisible: draft.isVisible,
      });
      setAllFeedbacks((prev) => [...prev.filter((f) => f.playerId !== target.playerId), res.data]);
      toast.success(`${target.name}님의 피드백을 저장했습니다`);
      setTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, '저장에 실패했습니다'));
    } finally {
      setIsSavingPersonal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  const customTags = draft.tags.filter((t) => !FEEDBACK_TAG_PRESETS.includes(t));

  return (
    <main className="px-5 pt-6 pb-28 space-y-5 relative">
      {/* Team review */}
      <SectionCard
        eyebrow="Team Review"
        title="팀 피드백"
        action={
          isManager && !isEditingTeam ? (
            <GhostButton
              onClick={() => {
                setTeamDraft(teamFeedback?.content ?? '');
                setIsEditingTeam(true);
              }}
            >
              <Pencil className="w-3 h-3" />
              {teamFeedback ? '수정' : '작성'}
            </GhostButton>
          ) : teamFeedback?.updatedAt ? (
            <span className="text-[10px] font-bold text-zinc-600">{formatUpdatedAt(teamFeedback.updatedAt)}</span>
          ) : null
        }
      >
        {isEditingTeam ? (
          <div className="space-y-3">
            <TextArea
              rows={6}
              autoFocus
              value={teamDraft}
              onChange={(e) => setTeamDraft(e.target.value)}
              placeholder={'잘된 점, 아쉬운 점, 다음 경기에서 바꿀 점을 정리해주세요'}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditingTeam(false)}
                disabled={isSavingTeam}
                className="h-11 rounded-xl text-xs font-black border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                취소
              </Button>
              <Button
                onClick={saveTeam}
                disabled={isSavingTeam || !teamDraft.trim()}
                className="h-11 rounded-xl text-xs font-black accent-gradient text-black border-0 hover:opacity-90 disabled:opacity-40"
              >
                {isSavingTeam ? <Spinner className="w-4 h-4 border-black/30 border-t-black" /> : '저장'}
              </Button>
            </div>
          </div>
        ) : teamFeedback?.content ? (
          <p className="text-sm font-bold text-zinc-200 leading-relaxed whitespace-pre-wrap border-l-2 border-[#7000FF]/70 pl-3">
            {teamFeedback.content}
          </p>
        ) : (
          <EmptyState
            icon={<MessageSquareText className="w-5 h-5" />}
            title="아직 팀 피드백이 없어요"
            desc={isManager ? '경기를 돌아보며 팀 전체에 남길 말을 정리해보세요' : '매니저가 경기 리뷰를 남기면 여기에 표시돼요'}
          />
        )}
      </SectionCard>

      {/* My feedback (player) */}
      {!isManager && (
        <SectionCard eyebrow="My Feedback" title="내 피드백">
          {myFeedback ? (
            <PersonalFeedbackCard feedback={myFeedback} />
          ) : (
            <EmptyState
              icon={<Sparkles className="w-5 h-5" />}
              title="아직 받은 피드백이 없어요"
              desc="경기에 참석한 선수에게 매니저가 피드백을 남기면 여기에 표시돼요"
            />
          )}
        </SectionCard>
      )}

      {/* Player feedback list (manager) */}
      {isManager && (
        <SectionCard
          eyebrow="Player Feedback"
          title="선수별 피드백"
          action={
            <div className="text-right">
              <p className="text-[10px] font-black text-zinc-500">
                작성 <span className="text-[#00F5FF]">{written.length}</span>/{attendees.length}
              </p>
              {avgRating && <p className="text-[10px] font-bold text-zinc-600">평균 {avgRating}</p>}
            </div>
          }
        >
          {attendees.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-5 h-5" />}
              title="참석한 선수가 없어요"
              desc="참석 투표한 선수에게만 피드백을 남길 수 있어요"
            />
          ) : (
            <ul className="space-y-2">
              {attendees.map((v) => {
                const f = feedbackOf(v.playerId);
                return (
                  <li key={v.playerId}>
                    <button
                      onClick={() => openEditor(v)}
                      className="w-full text-left rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] transition-colors px-3 py-3 flex items-center gap-3"
                    >
                      <Avatar name={v.name} image={v.profileImage} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black truncate">{v.name}</p>
                          {v.playerId === myPlayerId && <span className="text-[10px] font-bold text-zinc-500">(나)</span>}
                          {f && f.isVisible === false && <EyeOff className="w-3 h-3 text-zinc-600" aria-label="비공개" />}
                        </div>
                        {f ? (
                          <p className="text-[10px] font-bold text-zinc-500 truncate mt-0.5">
                            {f.tags?.length ? f.tags.slice(0, 3).join(' ') : f.pros || f.content || '평점만 입력됨'}
                          </p>
                        ) : (
                          <p className="text-[10px] font-bold text-zinc-700 mt-0.5">미작성</p>
                        )}
                      </div>
                      {f?.rating != null ? (
                        <span className={cn('text-xl font-black tabular-nums w-8 text-right', ratingColor(f.rating))}>
                          {f.rating}
                        </span>
                      ) : (
                        <span className="w-8 h-8 rounded-lg border border-[#00F5FF]/30 bg-[#00F5FF]/10 text-[#00F5FF] flex items-center justify-center">
                          {f ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      )}

      {/* 경기 전 전술 다시보기 */}
      {tactic && (
        <section className="relative z-10 rounded-3xl border border-white/5 overflow-hidden" style={{ background: 'rgba(18, 20, 32, 0.5)' }}>
          <button onClick={() => setShowTactic((v) => !v)} className="w-full px-5 py-4 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">Tactic Replay</p>
              <p className="text-sm font-black">경기 전 전술 다시보기</p>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-zinc-500 transition-transform', showTactic && 'rotate-180')} />
          </button>
          {showTactic && (
            <div className="px-5 pb-5 space-y-4">
              {tactic.content && (
                <p className="text-xs font-bold text-zinc-400 leading-relaxed whitespace-pre-wrap border-l-2 border-[#00F5FF]/50 pl-3">
                  {tactic.content}
                </p>
              )}
              <TacticPitch tactic={tactic} />
            </div>
          )}
        </section>
      )}

      {/* 개인 피드백 작성 (manager) */}
      <Dialog open={!!target} onOpenChange={(open) => !open && !isSavingPersonal && setTarget(null)}>
        <DialogContent className="bg-[#0E0F18] border border-white/10 text-white max-w-sm mx-auto overflow-hidden p-0 gap-0">
          <div className="absolute inset-x-0 top-0 h-[2px] accent-gradient z-10" />
          <div className="max-h-[80vh] overflow-y-auto px-5 pt-6 pb-4 space-y-5">
            <DialogHeader>
              <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00F5FF]" />
                개인 피드백
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold text-zinc-500">
                <span className="text-[#00F5FF] font-black">{target?.name}</span>님의 이번 경기를 평가해주세요
              </DialogDescription>
            </DialogHeader>

            {/* Rating */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-black text-zinc-400">평점</p>
                <p className={cn('text-sm font-black tabular-nums', ratingColor(draft.rating))}>
                  {draft.rating ?? '-'}
                  <span className="text-[10px] text-zinc-600"> / 10</span>
                </p>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                  const on = draft.rating != null && n <= draft.rating;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, rating: d.rating === n ? null : n }))}
                      className={cn(
                        'h-9 rounded-md text-[10px] font-black transition-all',
                        on ? 'text-black' : 'bg-white/[0.04] text-zinc-600 hover:text-zinc-300'
                      )}
                      style={on ? { background: `linear-gradient(135deg, #00F5FF, #7000FF)`, opacity: 0.5 + n * 0.05 } : undefined}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pros / cons */}
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-black text-[#00F5FF] mb-1.5 flex items-center gap-1.5">
                  <ThumbsUp className="w-3 h-3" /> 잘한 점
                </p>
                <TextArea rows={2} value={draft.pros ?? ''} onChange={(e) => setDraft((d) => ({ ...d, pros: e.target.value }))} placeholder="예: 전방 압박 타이밍이 좋았음" />
              </div>
              <div>
                <p className="text-[11px] font-black text-[#A970FF] mb-1.5 flex items-center gap-1.5">
                  <Wrench className="w-3 h-3" /> 보완할 점
                </p>
                <TextArea rows={2} value={draft.cons ?? ''} onChange={(e) => setDraft((d) => ({ ...d, cons: e.target.value }))} placeholder="예: 수비 전환 시 복귀가 늦음" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-[11px] font-black text-zinc-400 mb-2">태그</p>
              <div className="flex flex-wrap gap-1.5">
                {[...FEEDBACK_TAG_PRESETS, ...customTags].map((tag) => (
                  <TagChip key={tag} tag={tag} active={draft.tags.includes(tag)} onClick={() => toggleTag(tag)} />
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="직접 추가 (예: 침투)"
                  className="flex-1 h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-xs font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#7000FF]/60"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={!normalizeTag(customTag)}
                  className="h-9 px-3 rounded-lg text-[10px] font-black border border-[#7000FF]/40 bg-[#7000FF]/15 text-[#C9A6FF] disabled:opacity-40"
                >
                  추가
                </button>
              </div>
            </div>

            {/* Comment */}
            <div>
              <p className="text-[11px] font-black text-zinc-400 mb-1.5">종합 코멘트</p>
              <TextArea rows={3} value={draft.content ?? ''} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} placeholder="선수에게 전하고 싶은 말" />
            </div>

            <div className="-my-3">
              <ToggleRow
                label="선수에게 공개"
                hint={draft.isVisible ? '선수가 자신의 피드백을 볼 수 있어요' : '매니저만 볼 수 있어요'}
                value={draft.isVisible}
                editable
                onChange={(v) => setDraft((d) => ({ ...d, isVisible: v }))}
              />
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 px-5 pb-5 pt-3 border-t border-white/5 bg-transparent rounded-none flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setTarget(null)}
              disabled={isSavingPersonal}
              className="flex-1 h-11 rounded-xl text-xs font-black border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              취소
            </Button>
            <Button
              onClick={savePersonal}
              disabled={isSavingPersonal}
              className="flex-1 h-11 rounded-xl text-xs font-black accent-gradient text-black border-0 hover:opacity-90 disabled:opacity-40"
            >
              {isSavingPersonal ? <Spinner className="w-4 h-4 border-black/30 border-t-black" /> : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function PersonalFeedbackCard({ feedback }: { feedback: Feedback }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <RatingRing rating={feedback.rating} />
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Match Rating</p>
          {feedback.tags?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {feedback.tags.map((t) => (
                <TagChip key={t} tag={t} active />
              ))}
            </div>
          ) : (
            <p className="text-[11px] font-bold text-zinc-600">태그 없음</p>
          )}
        </div>
      </div>

      {(feedback.pros || feedback.cons) && (
        <div className="grid grid-cols-1 gap-2">
          {feedback.pros && (
            <div className="rounded-xl border border-[#00F5FF]/20 bg-[#00F5FF]/[0.04] px-4 py-3">
              <p className="text-[10px] font-black text-[#00F5FF] mb-1 flex items-center gap-1.5">
                <ThumbsUp className="w-3 h-3" /> 잘한 점
              </p>
              <p className="text-xs font-bold text-zinc-200 leading-relaxed whitespace-pre-wrap">{feedback.pros}</p>
            </div>
          )}
          {feedback.cons && (
            <div className="rounded-xl border border-[#7000FF]/30 bg-[#7000FF]/[0.06] px-4 py-3">
              <p className="text-[10px] font-black text-[#A970FF] mb-1 flex items-center gap-1.5">
                <Wrench className="w-3 h-3" /> 보완할 점
              </p>
              <p className="text-xs font-bold text-zinc-200 leading-relaxed whitespace-pre-wrap">{feedback.cons}</p>
            </div>
          )}
        </div>
      )}

      {feedback.content && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
          <p className="text-[10px] font-black text-zinc-500 mb-1">매니저 코멘트</p>
          <p className="text-xs font-bold text-zinc-300 leading-relaxed whitespace-pre-wrap">{feedback.content}</p>
        </div>
      )}

      {feedback.updatedAt && (
        <p className="text-[10px] font-bold text-zinc-700 text-right">{formatUpdatedAt(feedback.updatedAt)} 업데이트</p>
      )}
    </div>
  );
}
