'use client';

import { History, Target, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Tactic, VoteItem } from '@/types';
import { Avatar, EmptyState, SectionCard, formatUpdatedAt } from './shared';
import { TacticPitch } from './TacticPitch';
import { TacticOptionSections } from './TacticSections';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tactic: Tactic;
  personal: Tactic[];
  attendees: VoteItem[];
  myPlayerId: number | null;
}

/** 종료된 경기의 경기 전 전술 전체(작전 메모·전술판·세부 항목·개인 지시)를 읽기 전용 카드로 보여준다. */
export default function TacticReplayDialog({ open, onOpenChange, tactic, personal, attendees, myPlayerId }: Props) {
  const personalOf = (playerId: number) => personal.find((t) => t.playerId === playerId);
  const myInstruction = myPlayerId != null ? personalOf(myPlayerId) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#05060B] border border-white/10 text-white max-w-md mx-auto overflow-hidden p-0 gap-0">
        <div className="absolute inset-x-0 top-0 h-[2px] accent-gradient z-20" />
        <DialogHeader className="px-5 pt-6 pb-4 border-b border-white/5">
          <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-[#00F5FF]" />
            경기 전 전술
          </DialogTitle>
          <DialogDescription className="text-[11px] font-bold text-zinc-500">
            경기 전에 공유된 전술 전체예요{tactic.updatedAt ? ` · ${formatUpdatedAt(tactic.updatedAt)}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[78vh] overflow-y-auto px-4 py-4 space-y-4">
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

          <SectionCard eyebrow="Game Plan" title="팀 전술">
            <div className="space-y-5">
              {tactic.content && (
                <p className="text-sm font-bold text-zinc-200 leading-relaxed whitespace-pre-wrap border-l-2 border-[#00F5FF]/60 pl-3">
                  {tactic.content}
                </p>
              )}
              <TacticPitch tactic={tactic} />
            </div>
          </SectionCard>

          <TacticOptionSections view={tactic} />

          <SectionCard
            eyebrow="Player Instructions"
            title="개인 지시"
            action={<span className="text-[10px] font-black text-zinc-600">{personal.length}/{attendees.length}</span>}
          >
            {attendees.length === 0 ? (
              <EmptyState icon={<UserRound className="w-5 h-5" />} title="참석한 선수가 없어요" />
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
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>
      </DialogContent>
    </Dialog>
  );
}
