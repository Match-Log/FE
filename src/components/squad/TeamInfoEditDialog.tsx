'use client';

import { useEffect, useState } from 'react';
import { Shirt } from 'lucide-react';
import { toast } from 'sonner';
import { participationApi } from '@/api/participation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { POSITION_CATEGORIES, POSITIONS_BY_CATEGORY, POSITION_INFO } from '@/constants/position';
import { cn, getErrorMessage } from '@/lib/utils';
import type { Position, RosterItem } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: number;
  member: RosterItem;
  onSaved: (next: Pick<RosterItem, 'number' | 'mainPosition' | 'subPosition'>) => void;
}

/**
 * 팀 내 정보(등번호·주/부 포지션) 수정. MANAGER 전용 PATCH /teams/{teamId}/players/{playerId}.
 * BE는 number/mainPosition/subPosition 중 하나라도 오면 세 값을 한꺼번에 덮어쓰므로 항상 셋 다 보낸다.
 */
export default function TeamInfoEditDialog({ open, onOpenChange, teamId, member, onSaved }: Props) {
  const [number, setNumber] = useState('');
  const [mainPosition, setMainPosition] = useState<Position | undefined>();
  const [subPosition, setSubPosition] = useState<Position | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNumber(member.number?.toString() ?? '');
    setMainPosition(member.mainPosition);
    setSubPosition(member.subPosition);
  }, [open, member]);

  const parsedNumber = number.trim() === '' ? undefined : Number(number);
  const numberError =
    parsedNumber !== undefined && (!Number.isInteger(parsedNumber) || parsedNumber < 0 || parsedNumber > 99)
      ? '등번호는 0~99 사이로 입력해주세요'
      : null;

  const handleSave = async () => {
    if (numberError) return;
    setIsSaving(true);
    try {
      await participationApi.updatePlayer(teamId, member.playerId, {
        number: parsedNumber,
        mainPosition,
        subPosition,
      });
      onSaved({ number: parsedNumber, mainPosition, subPosition });
      toast.success(`${member.name}님의 팀 정보를 수정했습니다`);
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, '수정에 실패했습니다'));
    } finally {
      setIsSaving(false);
    }
  };

  const positionPicker = (
    value: Position | undefined,
    onChange: (p: Position | undefined) => void,
    tone: 'cyan' | 'purple',
    disabledPos?: Position
  ) => (
    <div className="space-y-2">
      {POSITION_CATEGORIES.map((cat) => (
        <div key={cat} className="flex items-center gap-2">
          <span className="w-6 text-[9px] font-black text-zinc-600">{cat}</span>
          <div className="flex flex-wrap gap-1.5">
            {POSITIONS_BY_CATEGORY[cat].map((pos) => {
              const selected = value === pos;
              const disabled = pos === disabledPos;
              return (
                <button
                  key={pos}
                  type="button"
                  title={POSITION_INFO[pos].description}
                  disabled={disabled}
                  onClick={() => onChange(selected ? undefined : pos)}
                  className={cn(
                    'h-7 px-2.5 rounded-md text-[10px] font-black border transition-colors',
                    disabled
                      ? 'border-white/5 text-zinc-800 cursor-not-allowed'
                      : selected
                      ? tone === 'cyan'
                        ? 'border-[#00F5FF]/60 bg-[#00F5FF]/10 text-[#00F5FF]'
                        : 'border-[#7000FF]/60 bg-[#7000FF]/15 text-[#C9A6FF]'
                      : 'border-white/10 bg-white/[0.02] text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {pos}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !isSaving && onOpenChange(o)}>
      <DialogContent className="bg-[#0E0F18] border border-white/10 text-white max-w-sm mx-auto overflow-hidden p-0 gap-0">
        <div className="absolute inset-x-0 top-0 h-[2px] accent-gradient z-10" />
        <div className="max-h-[80vh] overflow-y-auto px-5 pt-6 pb-4 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
              <Shirt className="w-4 h-4 text-[#00F5FF]" />
              팀 정보 수정
            </DialogTitle>
            <DialogDescription className="text-[11px] font-bold text-zinc-500">
              <span className="text-[#00F5FF] font-black">{member.name}</span>님의 등번호와 팀 내 포지션
            </DialogDescription>
          </DialogHeader>

          <div>
            <p className="text-[11px] font-black text-zinc-400 mb-1.5">등번호</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-zinc-600">#</span>
              <input
                type="number"
                inputMode="numeric"
                autoFocus
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="10"
                className="w-24 h-12 rounded-xl bg-white/[0.03] border border-white/10 px-4 text-2xl font-black text-white tabular-nums placeholder:text-zinc-700 focus:outline-none focus:border-[#00F5FF]/50"
              />
            </div>
            {numberError && <p className="text-[11px] font-bold text-red-400 mt-1.5">{numberError}</p>}
          </div>

          <div>
            <p className="text-[11px] font-black text-[#00F5FF] mb-2">주 포지션</p>
            {positionPicker(
              mainPosition,
              (p) => {
                setMainPosition(p);
                if (p && p === subPosition) setSubPosition(undefined);
              },
              'cyan'
            )}
          </div>

          <div>
            <p className="text-[11px] font-black text-[#A970FF] mb-2">부 포지션</p>
            {positionPicker(subPosition, setSubPosition, 'purple', mainPosition)}
          </div>
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
            disabled={isSaving || !!numberError}
            className="flex-1 h-11 rounded-xl text-xs font-black accent-gradient text-black border-0 hover:opacity-90 disabled:opacity-40"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              '저장'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
