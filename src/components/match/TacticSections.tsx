'use client';

import {
  CROSS_OPTIONS,
  DEFENSIVE_LINE_OPTIONS,
  DEFENSIVE_SPACING_OPTIONS,
  MARKING_OPTIONS,
  POSSESSION_OPTIONS,
  PRESSING_TRIGGER_OPTIONS,
  SET_PIECE_ATTACK_OPTIONS,
} from '@/constants/tactic';
import type { TacticFields } from '@/types';
import { OptionRow, SectionCard, ToggleRow } from './shared';
import { IntensityMeter } from './TacticPitch';

/**
 * 팀 전술 세부 항목 카드(수비·압박·공격·세트피스).
 * 전술 탭(작성/수정)과 피드백 탭의 "경기 전 전술 다시보기"(읽기 전용)가 함께 쓴다.
 */
export function TacticOptionSections({
  view,
  editable = false,
  onChange,
}: {
  view: TacticFields;
  editable?: boolean;
  onChange?: <K extends keyof TacticFields>(key: K, value: TacticFields[K]) => void;
}) {
  const set = <K extends keyof TacticFields>(key: K) => (value: TacticFields[K]) => onChange?.(key, value);

  return (
    <>
      <SectionCard eyebrow="Defense" title="수비">
        <div className="divide-y divide-white/5 -my-3">
          <OptionRow label="수비 라인" options={DEFENSIVE_LINE_OPTIONS} value={view.defensiveLineHeight} editable={editable} onChange={set('defensiveLineHeight')} />
          <OptionRow label="수비 간격" options={DEFENSIVE_SPACING_OPTIONS} value={view.defensiveSpacing} editable={editable} onChange={set('defensiveSpacing')} />
          <OptionRow label="측면 수비" options={MARKING_OPTIONS} value={view.flankDefense} editable={editable} onChange={set('flankDefense')} />
          <ToggleRow label="오프사이드 트랩" hint="라인을 동시에 올려 오프사이드를 유도" value={view.offsideTrap} editable={editable} onChange={set('offsideTrap')} />
        </div>
      </SectionCard>

      <SectionCard eyebrow="Pressing" title="압박">
        <div className="divide-y divide-white/5 -my-3">
          <OptionRow label="압박 시작 지점" options={PRESSING_TRIGGER_OPTIONS} value={view.pressingTrigger} editable={editable} onChange={set('pressingTrigger')} />
          <div className="py-3">
            <p className="text-[11px] font-black text-zinc-400 mb-2">압박 강도</p>
            <IntensityMeter value={view.pressingIntensity} editable={editable} onChange={set('pressingIntensity')} />
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Attack" title="공격">
        <div className="divide-y divide-white/5 -my-3">
          <OptionRow label="공격 전개" options={POSSESSION_OPTIONS} value={view.possessionStrategy} editable={editable} onChange={set('possessionStrategy')} />
          <OptionRow label="크로스" options={CROSS_OPTIONS} value={view.crossType} editable={editable} onChange={set('crossType')} />
        </div>
      </SectionCard>

      <SectionCard eyebrow="Set Piece" title="세트피스">
        <div className="divide-y divide-white/5 -my-3">
          <OptionRow label="공격" options={SET_PIECE_ATTACK_OPTIONS} value={view.setPieceAttack} editable={editable} onChange={set('setPieceAttack')} />
          <OptionRow label="수비" options={MARKING_OPTIONS} value={view.setPieceDefense} editable={editable} onChange={set('setPieceDefense')} />
        </div>
      </SectionCard>
    </>
  );
}
