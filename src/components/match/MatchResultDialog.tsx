'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus, Trophy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { matchApi } from '@/api/match';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getErrorMessage } from '@/lib/utils';
import type { Match } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match;
  teamName: string;
  onSaved: (match: Match) => void;
}

const MAX_SCORE = 99;

function ScoreStepper({
  label,
  value,
  onChange,
  tone,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  tone: 'cyan' | 'zinc';
}) {
  const set = (n: number) => onChange(Math.min(MAX_SCORE, Math.max(0, n)));
  return (
    <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate max-w-full">{label}</p>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={MAX_SCORE}
        value={String(value)}
        onChange={(e) => {
          const n = Math.floor(Number(e.target.value));
          set(Number.isFinite(n) ? n : 0);
        }}
        className={
          'w-20 h-16 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-4xl font-black tabular-nums focus:outline-none focus:border-[#00F5FF]/50 ' +
          (tone === 'cyan' ? 'text-[#00F5FF]' : 'text-zinc-300')
        }
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => set(value - 1)}
          disabled={value <= 0}
          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 disabled:opacity-30"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => set(value + 1)}
          disabled={value >= MAX_SCORE}
          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 disabled:opacity-30"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * 매니저 전용 경기 결과 입력. PATCH /matches/{id} { scoreHome, scoreAway, isFinished: true }.
 * BE는 isFinished를 true로만 바꿀 수 있어서(되돌리기 API 없음) 처음 종료 처리할 때 경고를 보여준다.
 * 이미 종료된 경기는 스코어만 수정한다.
 */
export default function MatchResultDialog({ open, onOpenChange, match, teamName, onSaved }: Props) {
  const isHome = match.homeAway === 'HOME';
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMyScore((isHome ? match.scoreHome : match.scoreAway) ?? 0);
    setOpponentScore((isHome ? match.scoreAway : match.scoreHome) ?? 0);
  }, [open, match, isHome]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await matchApi.updateMatch(match.matchId, {
        scoreHome: isHome ? myScore : opponentScore,
        scoreAway: isHome ? opponentScore : myScore,
        ...(match.finished ? {} : { isFinished: true }),
      });
      // PATCH 응답은 일부 필드만 내려주므로 전체를 다시 받아온다.
      const res = await matchApi.getMatch(match.matchId);
      onSaved(res.data);
      toast.success(match.finished ? '스코어를 수정했습니다' : '경기를 종료 처리했습니다');
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, '결과 저장에 실패했습니다'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isSaving && onOpenChange(o)}>
      <DialogContent className="bg-[#0E0F18] border border-white/10 text-white max-w-sm mx-auto overflow-hidden p-0 gap-0">
        <div className="absolute inset-x-0 top-0 h-[2px] accent-gradient z-10" />
        <div className="px-5 pt-6 pb-4 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#00F5FF]" />
              {match.finished ? '스코어 수정' : '경기 결과 입력'}
            </DialogTitle>
            <DialogDescription className="text-[11px] font-bold text-zinc-500">
              VS <span className="text-white font-black">{match.opponent}</span> · {isHome ? 'Home' : 'Away'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2">
            <ScoreStepper label={teamName} value={myScore} onChange={setMyScore} tone="cyan" />
            <p className="text-2xl font-black text-zinc-700 pt-12">:</p>
            <ScoreStepper label={match.opponent} value={opponentScore} onChange={setOpponentScore} tone="zinc" />
          </div>

          {!match.finished && (
            <div className="flex gap-2.5 rounded-xl border border-[#7000FF]/30 bg-[#7000FF]/10 p-3">
              <AlertTriangle className="w-4 h-4 text-[#C9A6FF] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-zinc-300 leading-relaxed">
                저장하면 경기가 <span className="text-white font-black">종료</span> 처리되고 되돌릴 수 없어요.
                참석 투표와 전술 수정이 막히고, 피드백·스탯 입력이 열려요.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 px-5 pb-5 pt-3 border-t border-white/5 bg-transparent rounded-none flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="flex-1 h-11 rounded-xl text-xs font-black border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-11 rounded-xl text-xs font-black accent-gradient text-black border-0 hover:opacity-90 disabled:opacity-40"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : match.finished ? (
              '저장'
            ) : (
              '종료 처리'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
