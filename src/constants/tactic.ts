import type {
  CrossType,
  DefensiveLineHeight,
  DefensiveSpacing,
  MarkingType,
  PossessionStrategy,
  PressingTrigger,
  SetPieceAttack,
  TacticFields,
} from '@/types';

export interface TacticOption<T extends string> {
  value: T;
  label: string;
  hint: string;
}

export const DEFENSIVE_LINE_OPTIONS: TacticOption<DefensiveLineHeight>[] = [
  { value: 'HIGH_LINE', label: '하이 라인', hint: '라인을 끌어올려 상대를 밀어낸다' },
  { value: 'MID_BLOCK', label: '미드 블록', hint: '중원에서 블록을 형성한다' },
  { value: 'LOW_BLOCK', label: '로우 블록', hint: '깊게 내려앉아 공간을 지운다' },
];

export const DEFENSIVE_SPACING_OPTIONS: TacticOption<DefensiveSpacing>[] = [
  { value: 'COMPACT', label: '좁게', hint: '선수 간격을 좁혀 중앙을 막는다' },
  { value: 'WIDE', label: '넓게', hint: '폭을 넓게 가져가 측면까지 커버한다' },
];

export const MARKING_OPTIONS: TacticOption<MarkingType>[] = [
  { value: 'MAN_MARK', label: '대인 마크', hint: '정해진 상대를 끝까지 따라간다' },
  { value: 'ZONE_MARK', label: '지역 방어', hint: '맡은 구역을 지킨다' },
];

export const POSSESSION_OPTIONS: TacticOption<PossessionStrategy>[] = [
  { value: 'POSSESSION', label: '점유', hint: '짧은 패스로 볼을 소유하며 전개' },
  { value: 'COUNTER_ATTACK', label: '역습', hint: '볼을 뺏으면 빠르게 전방으로' },
  { value: 'MIXED', label: '혼합', hint: '상황에 따라 점유와 역습을 섞는다' },
];

export const CROSS_OPTIONS: TacticOption<CrossType>[] = [
  { value: 'EARLY_CROSS', label: '얼리 크로스', hint: '수비가 정비되기 전에 빠르게' },
  { value: 'BOX_ENTRY_CROSS', label: '박스 침투', hint: '박스 안으로 파고들어 올린다' },
  { value: 'CUTBACK', label: '컷백', hint: '라인 끝에서 뒤로 내준다' },
];

export const PRESSING_TRIGGER_OPTIONS: TacticOption<PressingTrigger>[] = [
  { value: 'FRONT', label: '전방', hint: '상대 진영에서부터 압박' },
  { value: 'MIDFIELD', label: '중원', hint: '하프라인 부근에서 압박' },
  { value: 'OWN_HALF', label: '자기 진영', hint: '우리 진영으로 들어오면 압박' },
];

export const SET_PIECE_ATTACK_OPTIONS: TacticOption<SetPieceAttack>[] = [
  { value: 'SHORT_CORNER', label: '숏 코너', hint: '짧게 연결해 각을 만든다' },
  { value: 'DIRECT_SHOT', label: '직접 슈팅', hint: '프리킥은 직접 노린다' },
  { value: 'HEADER_TARGET', label: '헤더 타깃', hint: '장신 선수 머리를 노린다' },
];

export const PRESSING_INTENSITY_LABELS: Record<number, string> = {
  1: '매우 낮음',
  2: '낮음',
  3: '보통',
  4: '높음',
  5: '매우 높음',
};

export const EMPTY_TACTIC: TacticFields = {
  content: '',
  defensiveLineHeight: null,
  defensiveSpacing: null,
  setPieceDefense: null,
  flankDefense: null,
  offsideTrap: null,
  crossType: null,
  setPieceAttack: null,
  possessionStrategy: null,
  pressingTrigger: null,
  pressingIntensity: null,
};

// 개인 피드백 태그 프리셋. BE는 "#태그" 문자열 배열로 저장한다.
export const FEEDBACK_TAG_PRESETS = [
  '#득점',
  '#어시스트',
  '#패스',
  '#빌드업',
  '#드리블',
  '#위치선정',
  '#압박',
  '#수비',
  '#크로스',
  '#활동량',
  '#세트피스',
  '#리더십',
];

export const normalizeTag = (raw: string) => {
  const t = raw.trim().replace(/^#+/, '').replace(/\s+/g, '');
  return t ? `#${t}` : '';
};
