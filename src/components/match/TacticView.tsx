'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Pencil, Target, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { tacticApi } from '@/api/tactic';
import { cn, getErrorMessage, nullIfNotFound } from '@/lib/utils';
import {
  CROSS_OPTIONS,
  DEFENSIVE_LINE_OPTIONS,
  DEFENSIVE_SPACING_OPTIONS,
  EMPTY_TACTIC,
  MARKING_OPTIONS,
  POSSESSION_OPTIONS,
  PRESSING_TRIGGER_OPTIONS,
  SET_PIECE_ATTACK_OPTIONS,
} from '@/constants/tactic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Tactic, TacticFields, VoteItem } from '@/types';
import {
  Avatar,
  EmptyState,
  GhostButton,
  OptionRow,
  SectionCard,
  Spinner,
  TextArea,
  ToggleRow,
  formatUpdatedAt,
} from './shared';
import { IntensityMeter, TacticPitch } from './TacticPitch';

interface Props {
  matchId: number;
  isManager: boolean;
  myPlayerId: number | null;
  attendees: VoteItem[];
}

const pickFields = (t: Tactic | null): TacticFields => ({
  ...EMPTY_TACTIC,
  ...(t
    ? {
        content: t.content ?? '',
        defensiveLineHeight: t.defensiveLineHeight ?? null,
        defensiveSpacing: t.defensiveSpacing ?? null,
        setPieceDefense: t.setPieceDefense ?? null,
        flankDefense: t.flankDefense ?? null,
        offsideTrap: t.offsideTrap ?? null,
        crossType: t.crossType ?? null,
        setPieceAttack: t.setPieceAttack ?? null,
        possessionStrategy: t.possessionStrategy ?? null,
        pressingTrigger: t.pressingTrigger ?? null,
        pressingIntensity: t.pressingIntensity ?? null,
      }
    : {}),
});

// 403(매니저 아님), 409(종료된 경기·미참석 선수) 등은 BE 메시지를 그대로 보여준다.
const saveErrorMessage = (err: unknown) => getErrorMessage(err, '저장에 실패했습니다');

export default function TacticView({ matchId, isManager, myPlayerId, attendees }: Props) {
  const [teamTactic, setTeamTactic] = useState<Tactic | null>(null);
  const [personal, setPersonal] = useState<Tactic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TacticFields>(EMPTY_TACTIC);
  const [isSaving, setIsSaving] = useState(false);

  const [target, setTarget] = useState<VoteItem | null>(null);
  const [personalDraft, setPersonalDraft] = useState('');
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  useEffect(() => {
    Promise.all([
      nullIfNotFound(tacticApi.getTeamTactic(matchId)),
      tacticApi.getPersonalTactics(matchId).then((r) => r.data).catch(() => [] as Tactic[]),
    ])
      .then(([team, list]) => {
        setTeamTactic(team);
        setPersonal(list);
      })
      .catch(() => toast.error('전술을 불러올 수 없습니다'))
      .finally(() => setIsLoading(false));
  }, [matchId]);

  const view: TacticFields = isEditing ? draft : pickFields(teamTactic);
  const set = <K extends keyof TacticFields>(key: K, value: TacticFields[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const startEdit = () => {
    setDraft(pickFields(teamTactic));
    setIsEditing(true);
  };

  const saveTeamTactic = async () => {
    setIsSaving(true);
    try {
      const res = await tacticApi.saveTeamTactic(matchId, {
        ...draft,
        content: draft.content?.trim() || null,
      });
      setTeamTactic(res.data);
      setIsEditing(false);
      toast.success('팀 전술이 저장되었습니다');
    } catch (err) {
      toast.error(saveErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const personalOf = (playerId: number) => personal.find((t) => t.playerId === playerId);
  const myInstruction = myPlayerId != null ? personalOf(myPlayerId) : undefined;

  const openPersonal = (v: VoteItem) => {
    setTarget(v);
    setPersonalDraft(personalOf(v.playerId)?.content ?? '');
  };

  const savePersonal = async () => {
    if (!target) return;
    const content = personalDraft.trim();
    if (!content) {
      toast.error('지시 내용을 입력해주세요');
      return;
    }
    setIsSavingPersonal(true);
    try {
      const res = await tacticApi.savePersonalTactic(matchId, target.playerId, content);
      setPersonal((prev) => [...prev.filter((t) => t.playerId !== target.playerId), res.data]);
      toast.success(`${target.name}님에게 개인 지시를 남겼습니다`);
      setTarget(null);
    } catch (err) {
      toast.error(saveErrorMessage(err));
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

  const hasTeamTactic = !!teamTactic;
  const showBoard = hasTeamTactic || isEditing;

  return (
    <main className="px-5 pt-6 pb-28 space-y-5 relative">
      {/* 내 개인 지시: 선수 입장에서 가장 먼저 봐야 할 정보 */}
      {myInstruction?.content && (
        <section
          className="relative z-10 rounded-3xl p-[1px]"
          style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.6), rgba(112,0,255,0.6))' }}
        >
          <div className="rounded-[23px] bg-[#0B0C14] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3.5 h-3.5 text-[#00F5FF]" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#00F5FF]">My Mission</p>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed whitespace-pre-wrap">{myInstruction.content}</p>
          </div>
        </section>
      )}

      {/* Game plan */}
      <SectionCard
        eyebrow="Game Plan"
        title="팀 전술"
        action={
          isManager && !isEditing ? (
            <GhostButton onClick={startEdit}>
              <Pencil className="w-3 h-3" />
              {hasTeamTactic ? '수정' : '작성'}
            </GhostButton>
          ) : teamTactic?.updatedAt && !isEditing ? (
            <span className="text-[10px] font-bold text-zinc-600">{formatUpdatedAt(teamTactic.updatedAt)}</span>
          ) : null
        }
      >
        {!showBoard ? (
          <EmptyState
            icon={<ClipboardList className="w-5 h-5" />}
            title="아직 등록된 전술이 없어요"
            desc={isManager ? '수비 라인, 압박, 공격 전개를 정해 팀원들과 공유해보세요' : '매니저가 전술을 등록하면 여기에 표시돼요'}
          />
        ) : (
          <div className="space-y-5">
            {isEditing ? (
              <TextArea
                rows={4}
                value={draft.content ?? ''}
                onChange={(e) => set('content', e.target.value)}
                placeholder="이번 경기 작전 메모 (예: 초반 15분은 라인 내리고 역습 위주)"
              />
            ) : (
              view.content && (
                <p className="text-sm font-bold text-zinc-200 leading-relaxed whitespace-pre-wrap border-l-2 border-[#00F5FF]/60 pl-3">
                  {view.content}
                </p>
              )
            )}
            <TacticPitch tactic={view} />
          </div>
        )}
      </SectionCard>

      {showBoard && (
        <>
          <SectionCard eyebrow="Defense" title="수비">
            <div className="divide-y divide-white/5 -my-3">
              <OptionRow label="수비 라인" options={DEFENSIVE_LINE_OPTIONS} value={view.defensiveLineHeight} editable={isEditing} onChange={(v) => set('defensiveLineHeight', v)} />
              <OptionRow label="수비 간격" options={DEFENSIVE_SPACING_OPTIONS} value={view.defensiveSpacing} editable={isEditing} onChange={(v) => set('defensiveSpacing', v)} />
              <OptionRow label="측면 수비" options={MARKING_OPTIONS} value={view.flankDefense} editable={isEditing} onChange={(v) => set('flankDefense', v)} />
              <ToggleRow label="오프사이드 트랩" hint="라인을 동시에 올려 오프사이드를 유도" value={view.offsideTrap} editable={isEditing} onChange={(v) => set('offsideTrap', v)} />
            </div>
          </SectionCard>

          <SectionCard eyebrow="Pressing" title="압박">
            <div className="divide-y divide-white/5 -my-3">
              <OptionRow label="압박 시작 지점" options={PRESSING_TRIGGER_OPTIONS} value={view.pressingTrigger} editable={isEditing} onChange={(v) => set('pressingTrigger', v)} />
              <div className="py-3">
                <p className="text-[11px] font-black text-zinc-400 mb-2">압박 강도</p>
                <IntensityMeter value={view.pressingIntensity} editable={isEditing} onChange={(v) => set('pressingIntensity', v)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard eyebrow="Attack" title="공격">
            <div className="divide-y divide-white/5 -my-3">
              <OptionRow label="공격 전개" options={POSSESSION_OPTIONS} value={view.possessionStrategy} editable={isEditing} onChange={(v) => set('possessionStrategy', v)} />
              <OptionRow label="크로스" options={CROSS_OPTIONS} value={view.crossType} editable={isEditing} onChange={(v) => set('crossType', v)} />
            </div>
          </SectionCard>

          <SectionCard eyebrow="Set Piece" title="세트피스">
            <div className="divide-y divide-white/5 -my-3">
              <OptionRow label="공격" options={SET_PIECE_ATTACK_OPTIONS} value={view.setPieceAttack} editable={isEditing} onChange={(v) => set('setPieceAttack', v)} />
              <OptionRow label="수비" options={MARKING_OPTIONS} value={view.setPieceDefense} editable={isEditing} onChange={(v) => set('setPieceDefense', v)} />
            </div>
          </SectionCard>

          {isEditing && (
            <div className="grid grid-cols-2 gap-2 relative z-10">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="h-12 rounded-xl text-xs font-black border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                취소
              </Button>
              <Button
                onClick={saveTeamTactic}
                disabled={isSaving}
                className="h-12 rounded-xl text-xs font-black accent-gradient text-black border-0 hover:opacity-90"
              >
                {isSaving ? <Spinner className="w-4 h-4 border-black/30 border-t-black" /> : '전술 저장'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* 개인 지시 */}
      <SectionCard
        eyebrow="Player Instructions"
        title="개인 지시"
        action={<span className="text-[10px] font-black text-zinc-600">{personal.length}/{attendees.length}</span>}
      >
        {attendees.length === 0 ? (
          <EmptyState
            icon={<UserRound className="w-5 h-5" />}
            title="참석 확정된 선수가 없어요"
            desc="참석 투표한 선수에게만 개인 지시를 남길 수 있어요"
          />
        ) : (
          <ul className="space-y-2">
            {attendees.map((v) => {
              const t = personalOf(v.playerId);
              const isMe = v.playerId === myPlayerId;
              return (
                <li
                  key={v.playerId}
                  className={cn(
                    'rounded-xl border px-3 py-3 flex gap-3',
                    isMe ? 'border-[#00F5FF]/25 bg-[#00F5FF]/[0.04]' : 'border-white/8 bg-white/[0.02]'
                  )}
                >
                  <Avatar name={v.name} image={v.profileImage} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 h-5">
                      <p className="text-xs font-black truncate">{v.name}</p>
                      {isMe && <span className="text-[10px] font-bold text-zinc-500">(나)</span>}
                    </div>
                    <p
                      className={cn(
                        'text-[11px] font-bold leading-relaxed mt-0.5 whitespace-pre-wrap',
                        t?.content ? 'text-zinc-300' : 'text-zinc-700'
                      )}
                    >
                      {t?.content || '지시 없음'}
                    </p>
                  </div>
                  {isManager && (
                    <GhostButton tone={t ? 'zinc' : 'cyan'} onClick={() => openPersonal(v)}>
                      {t ? '수정' : '작성'}
                    </GhostButton>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* 개인 지시 작성 */}
      <Dialog open={!!target} onOpenChange={(open) => !open && !isSavingPersonal && setTarget(null)}>
        <DialogContent className="bg-[#0E0F18] border border-white/10 text-white max-w-sm mx-auto overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] accent-gradient" />
          <DialogHeader className="pt-1">
            <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4 text-[#00F5FF]" />
              개인 지시
            </DialogTitle>
            <DialogDescription className="text-[11px] font-bold text-zinc-500">
              <span className="text-[#00F5FF] font-black">{target?.name}</span>님에게만 전달할 역할과 주문을 적어주세요
            </DialogDescription>
          </DialogHeader>
          <TextArea
            rows={5}
            autoFocus
            value={personalDraft}
            onChange={(e) => setPersonalDraft(e.target.value)}
            placeholder="예: 상대 10번 대인 마크. 공 뺏으면 바로 왼쪽 측면으로 전환"
          />
          <DialogFooter className="mx-0 mb-0 p-0 border-0 bg-transparent rounded-none flex-row gap-2">
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
              disabled={isSavingPersonal || !personalDraft.trim()}
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
