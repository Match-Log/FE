# Design Spec — MatchLog

## 공통 규칙 (Design Tokens)

| 항목 | 값 |
|---|---|
| Background | #0D0D0D (거의 블랙) |
| Primary/Accent | #2F6F4F 계열 emerald green (아이콘 배경) |
| Accent Text (링크) | #6EE7B7 계열 mint green |
| Surface (input/버튼 배경) | #262626 |
| Border | #3A3A3A (subtle gray) |
| Text Primary | #FFFFFF |
| Text Muted | #8A8A8A (placeholder, 보조 텍스트) |
| Font | Pretendard 또는 시스템 폰트 |
| 타이틀 | 28px / bold |
| 서브타이틀 / 보조 텍스트 | 14px / regular |
| 본문 / 버튼 텍스트 | 16px / medium~bold |
| 캡션 (링크, 안내문) | 12px |
| Radius (input, 버튼) | 12px |
| Radius (아이콘) | 20px |
| 레이아웃 | 모바일 우선, 세로 중앙 정렬, 좌우 padding 24px |

---

## 화면: 로그인 (Login)

### 레이아웃 구조 (세로 흐름, 전부 중앙 정렬)

```
[상단 여백 ~64px]
  [앱 아이콘 80x80, radius 20px, green bg, 중앙에 흰색 축구공 아이콘]
  [간격 16px]
  [타이틀 "MatchLog" — 28px bold white]
  [간격 8px]
  [서브타이틀 "축구팀 경기 기록 & 피드백 플랫폼" — 14px gray]
  [간격 40px]

  [이메일 입력 필드 — full width, height 52px]
  [간격 12px]
  [비밀번호 입력 필드 — full width, height 52px]
  [간격 8px]
  [우측 정렬: "비밀번호를 잊으셨나요?" — 12px gray]
  [간격 16px]

  [로그인 버튼 — full width, height 52px, border 1px gray, radius 12px]
  [간격 24px]

  [구분선: 좌측 라인 --- "또는" --- 우측 라인]
  [간격 24px]

  [Google 버튼 | Kakao 버튼 — 2열 grid, gap 12px, height 52px]
  [간격 24px]

  [하단: "아직 계정이 없으신가요? [회원가입]" — 중앙 정렬]
```

### 컴포넌트 상세

**앱 아이콘 (AppIcon)**
- 80×80px, radius 20px
- 배경: primary green
- 내부: 축구공 아이콘(outline), 흰색, 32px, 중앙 정렬

**타이틀 영역**
- "MatchLog": 28px bold white, 중앙 정렬
- 서브타이틀: 14px regular, text-muted, 중앙 정렬

**Input — 이메일 / 비밀번호**
- width 100%, height 52px, padding-left 16px
- 배경 surface(#262626), border 없음, radius 12px
- placeholder: text-muted, 좌측 정렬
- 비밀번호 필드는 type="password"
- 상태:
  - default: 위 스타일
  - focus: border 1px accent green 추가
  - error: border 1px red + 필드 하단에 에러 메시지 (12px, red)

**비밀번호 찾기 링크**
- 우측 정렬, 12px text-muted
- hover 시 text-primary로 변경

**로그인 버튼**
- full width, height 52px, radius 12px
- 배경 surface, border 1px border-color
- 텍스트: white, 16px, bold, 중앙 정렬
- 상태:
  - default: 위 스타일
  - hover: 배경 약간 밝게
  - disabled: 이메일/비밀번호 미입력 시 opacity 50%, 클릭 불가
  - loading: 텍스트 대신 스피너 표시

**구분선**
- 좌우 1px 라인(border-color) + 중앙 "또는" 텍스트(12px, text-muted)

**소셜 로그인 버튼 (Google / Kakao)**
- 2열 grid, gap 12px, 각 height 52px, radius 12px, 배경 surface
- 아이콘(20px) + 텍스트, 가로 중앙 정렬
- Google: 멀티컬러 G 로고 아이콘 + "Google"
- Kakao: 노란색 말풍선 아이콘 + "Kakao"

**하단 회원가입 안내**
- 중앙 정렬, "아직 계정이 없으신가요?" (14px, text-muted) + "회원가입" (14px, accent green, bold, 밑줄, 링크)

### 반응형
- 모바일(~430px 이하): 전체 화면 폭 사용, 좌우 padding 24px
- 태블릿 이상: 콘텐츠 max-width 420px로 중앙 정렬, 나머지 배경은 background 색상으로 채움

### 인터랙션 / 상태 (와이어프레임엔 없지만 구현 시 필요)
- 이메일 형식 미충족 시 실시간 유효성 검사 + 에러 메시지
- 로그인 실패(잘못된 계정) 시 에러 토스트 또는 버튼 상단 안내 문구
- 로그인 버튼: 이메일+비밀번호 모두 입력되기 전까지 disabled
- 소셜 로그인 클릭 시 버튼 내 로딩 스피너로 전환
- "비밀번호를 잊으셨나요?" 클릭 시 비밀번호 재설정 플로우로 이동 (별도 화면, 추후 정의)

### 참고 컴포넌트 매핑 (component-inventory.md 연동 시)
- Input → components/ui/Input.tsx
- Button (primary/outline) → components/ui/Button.tsx
- SocialButton → components/ui/SocialButton.tsx
- AuthLayout(중앙 정렬 컨테이너) → components/layout/AuthLayout.tsx
