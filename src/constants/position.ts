// 포지션 기준 — BE `constant/lineup/Position` enum과 1:1로 맞춘다.
// BE enum이 바뀌면 이 파일만 고치면 된다.

export type PositionCategory = 'DF' | 'MF' | 'FW';

export const POSITION_CATEGORIES: readonly PositionCategory[] = ['DF', 'MF', 'FW'];

export const POSITION_CATEGORY_LABELS: Record<PositionCategory, string> = {
  DF: 'Defender',
  MF: 'Midfielder',
  FW: 'Forward',
};

export const POSITIONS = [
  // Defender
  'CB', 'LB', 'RB', 'WB',
  // Midfielder
  'CDM', 'CM', 'LM', 'RM', 'CAM', 'AM',
  // Forward
  'LW', 'RW', 'ST', 'CF',
] as const;

export type Position = (typeof POSITIONS)[number];

export const POSITION_INFO: Record<Position, { description: string; category: PositionCategory }> = {
  CB: { description: '센터백', category: 'DF' },
  LB: { description: '레프트백', category: 'DF' },
  RB: { description: '라이트백', category: 'DF' },
  WB: { description: '윙백', category: 'DF' },

  CDM: { description: '수비형 미드필더', category: 'MF' },
  CM: { description: '중앙 미드필더', category: 'MF' },
  LM: { description: '레프트 미드필더', category: 'MF' },
  RM: { description: '라이트 미드필더', category: 'MF' },
  CAM: { description: '중앙 공격형 미드필더', category: 'MF' },
  AM: { description: '공격형 미드필더', category: 'MF' },

  LW: { description: '레프트 윙어', category: 'FW' },
  RW: { description: '라이트 윙어', category: 'FW' },
  ST: { description: '스트라이커', category: 'FW' },
  CF: { description: '센터 포워드', category: 'FW' },
};

export const POSITIONS_BY_CATEGORY: Record<PositionCategory, Position[]> = {
  DF: POSITIONS.filter((p) => POSITION_INFO[p].category === 'DF'),
  MF: POSITIONS.filter((p) => POSITION_INFO[p].category === 'MF'),
  FW: POSITIONS.filter((p) => POSITION_INFO[p].category === 'FW'),
};

export function isPosition(value: unknown): value is Position {
  return typeof value === 'string' && value in POSITION_INFO;
}

/** 선수 포지션의 분류. 포지션이 없거나 모르는 값이면 null. */
export function getPositionCategory(pos?: string | null): PositionCategory | null {
  return isPosition(pos) ? POSITION_INFO[pos].category : null;
}

// ── 라인업 전용 ──────────────────────────────────────────────────────────────
// GK는 선수 포지션(BE enum)에는 없고 라인업 자리에서만 쓴다.
// BE 라인업 spot의 position은 문자열이라 'GK'도 그대로 저장된다.

export const GK = 'GK' as const;

export type LineupPosition = Position | typeof GK;

export type LineupCategory = typeof GK | PositionCategory;

export function getLineupCategory(pos: LineupPosition): LineupCategory {
  return pos === GK ? GK : POSITION_INFO[pos].category;
}
