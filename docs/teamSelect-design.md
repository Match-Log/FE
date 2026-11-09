# Design Spec — MatchLog 팀 선택 (선수 미등록 상태)

로그인/회원가입과 같은 다크 테마, 동일 토큰을 공유합니다. 회원가입 완료 후 아직 "선수 등록"을 하지 않은 사용자가 앱에 처음 들어왔을 때 보는 홈 화면입니다. (선수 등록 완료 후에는 다른 홈 화면 상태로 전환 — 별도 문서 필요 시 추가)

## 추가 Design Tokens

| 항목 | 값 |
|---|---|
| Notice 배경 (안내 배너) | primary green의 저채도 버전, 예: rgba(47,111,79,0.15) |
| Notice 강조 텍스트 | success/primary green |
| 카드 배경 (일반) | surface(#262626) |
| 카드 배경 (강조 CTA) | surface + border 1~2px primary green |
| 비활성 카드 | 위 카드 스타일 + opacity 50~60%, 클릭 불가 |
| 아이콘 — 사람(팀 생성) | muted blue-gray, 예: #8AA0C4 |
| 아이콘 — 열쇠(초대 코드) | muted gold, 예: #E8C468 |

---

## 화면: 팀 선택 (선수 등록 전)

### 레이아웃 구조

```
[상단 헤더 — 좌우 padding 20px, height 56px]
  ["MatchLog" 로고 텍스트, bold white, 18px]  ...  [설정 아이콘(⚙) 우측, 20px muted]

[간격 20px]
["안녕하세요, {사용자이름}님 👋" — 20px bold white]
[간격 4px]
["시작 전 선수 등록이 필요해요" — 14px muted]

[간격 20px]
[안내 배너(Notice) — full width, radius 12px, notice 배경, padding 16px]
  [체크 아이콘(20px, success green)] [간격 8px]
  ["선수 등록 후 팀 활동이 가능해요." — 14px bold success green]
  [간격 4px, 아이콘 폭만큼 들여쓰기]
  ["등록을 먼저 완료하면 팀 생성 및 초대 코드 가입이 활성화됩니다." — 13px muted, 2줄]

[간격 16px]
[선수 등록하기 카드(강조 CTA) — full width, radius 16px, border primary green, padding 16~20px, 가로 배치]
  [좌: 축구공 아이콘(40px 배지, green 배경 or outline)]
  [간격 12px]
  [중앙: "선수 등록하기" 16px bold, primary/accent green]
       ["생년월일 · 신체정보 · 주발 · 경력" 12px muted]
  [우: ">" chevron 아이콘, muted]

[간격 24px]
["팀 참여" — 12px muted, 좌측 정렬]
[간격 8px]
[2열 grid, gap 12px]
  [팀 생성 카드 — 비활성 상태]
    [사람 아이콘 24px muted-blue, 중앙 상단]
    ["팀 생성" 14px bold white]
    ["내가 만드는 팀" 12px muted]
  [초대 코드 가입 카드 — 비활성 상태]
    [열쇠 아이콘 24px muted-gold, 중앙 상단]
    ["초대 코드 가입" 14px bold white]
    ["코드로 참여" 12px muted]

[간격 12px]
["선수 등록 완료 후 활성화돼요" — 12px muted, 중앙 정렬]
```

### 컴포넌트 상세

**상단 헤더 (AppHeader)**
- 인증 화면(로그인/회원가입)의 헤더와 다름 — 뒤로가기 없음, 로고 + 설정 아이콘 구조
- 좌측: "MatchLog" 텍스트 로고, 18px bold white
- 우측: 설정 아이콘(⚙, 20px, muted), 클릭 시 설정 화면 이동

**인사 영역 (GreetingSection)**
- "안녕하세요, {사용자 이름}님 👋" — 사용자 이름은 동적 바인딩, 20px bold white
- 하단 서브텍스트 14px muted — 사용자의 등록 상태에 따라 문구 달라짐 (이 화면은 "시작 전 선수 등록이 필요해요")

**안내 배너 (NoticeBanner)**
- 재사용 가능한 공용 컴포넌트로 설계 (success/warning/info 등 variant 확장 가능)
- 배경: primary green 저채도, radius 12px, padding 16px
- 좌측 아이콘(체크/정보), 우측에 제목(bold, success green) + 본문(muted, 2줄까지)

**선수 등록하기 카드 (PrimaryActionCard)**
- 화면에서 유일하게 활성화된 CTA — 시각적으로 가장 강조 (border 컬러로 구분)
- 가로 배치: 아이콘 배지 + 텍스트(제목+설명) + 화살표
- 클릭 시 선수 등록 플로우로 이동 (별도 화면, 추후 정의)
- hover/pressed 시 배경 약간 밝게 또는 border 두께 증가

**팀 참여 섹션 라벨**
- "팀 참여" 12px muted, 좌측 정렬, 카드 그룹 상단 레이블

**옵션 카드 — 팀 생성 / 초대 코드 가입 (TeamOptionCard)**
- 2열 grid, 정사각형에 가까운 비율, 내부 세로 중앙 정렬(아이콘 → 제목 → 설명)
- **비활성 상태(disabled)가 기본값**: 선수 등록 완료 전에는 opacity 50~60%로 흐리게, 클릭 이벤트 막음
- 선수 등록 완료 후에는 동일 컴포넌트가 활성 상태(opacity 100%, 클릭 가능)로 전환 — disabled prop으로 제어
- 아이콘 색상으로 카드 구분: 팀 생성(사람 아이콘, blue-gray) / 초대 코드 가입(열쇠 아이콘, gold)

**하단 안내 캡션**
- "선수 등록 완료 후 활성화돼요" — 12px muted, 중앙 정렬, 위 두 카드가 왜 비활성인지 설명

### 반응형
- 모바일(~430px 이하): 전체 폭, 좌우 padding 20px
- 태블릿 이상: 콘텐츠 max-width 480px 중앙 정렬 (홈 화면은 로그인류보다 살짝 넓게 잡아도 무방)

### 인터랙션 / 상태
- "선수 등록하기" 클릭 → 선수 등록 플로우 시작
- "팀 생성" / "초대 코드 가입" 카드는 선수 등록 완료 전까지 클릭 무반응(비활성) — 굳이 클릭했을 때 안내 토스트("선수 등록을 먼저 완료해주세요")를 띄우는 것도 고려 가능
- 선수 등록 완료 시: 이 화면 자체가 다른 상태(등록 완료 홈 화면)로 교체되거나, 두 옵션 카드만 활성화되고 안내 배너/CTA 카드가 사라지는 형태로 전환 — 정확한 전환 방식은 등록 완료 후 화면 디자인이 나오면 함께 정의

### 참고 컴포넌트 매핑
- AppHeader → components/layout/AppHeader.tsx
- NoticeBanner → components/ui/NoticeBanner.tsx (variant: success/info/warning 확장 가능하게 설계 권장)
- PrimaryActionCard → components/home/PlayerRegisterCard.tsx
- TeamOptionCard → components/home/TeamOptionCard.tsx (disabled prop)
- Button, Input 등은 이 화면에서 사용 안 함 (카드형 네비게이션 위주)

### 참고 사항
- 이 문서는 "선수 미등록" 상태 1가지만 다룹니다. 선수 등록 완료 후의 홈 화면, 팀 생성/초대 코드 가입 각 플로우는 이미지가 준비되면 별도 `-design.md`로 이어서 작성하면 됩니다.