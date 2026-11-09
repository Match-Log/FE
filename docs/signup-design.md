# Design Spec — MatchLog 회원가입 (Signup)

로그인과 동일한 다크 테마를 공유합니다. 공통 토큰은 `login-design.md`와 같고, 이 화면에서 추가로 쓰이는 토큰만 아래 표에 더했습니다.

## 공통 규칙 (Design Tokens)

| 항목 | 값 |
|---|---|
| Background | #0D0D0D |
| Primary/Accent | #2F6F4F 계열 emerald green |
| Accent Text (링크) | #6EE7B7 계열 mint green |
| Success (유효성 통과) | #4ADE80 계열 green — 체크 아이콘 + 안내 텍스트 |
| Error (유효성 실패) | #F87171 계열 red — 안내 텍스트 (와이어프레임엔 없지만 구현 필요) |
| Surface (input/버튼 배경) | #262626 |
| Border / 진행바 미완료 구간 | #3A3A3A |
| Text Primary | #FFFFFF |
| Text Muted | #8A8A8A |
| Radius (input, 버튼) | 12px |
| Radius (아바타) | full (원형) |

---

## 화면: 회원가입 1단계 — 기본 정보 입력

### 레이아웃 구조 (세로 흐름, 좌측 정렬 기본 / 버튼류만 예외)

```
[헤더 — height 56px, 좌우 padding 20px]
  [← 뒤로가기 아이콘 24px] [간격 12px] ["회원가입" 18px bold white]

[간격 16px]
[진행바 — 좌우 padding 24px]
  [세그먼트1: 채워짐(success/primary green), height 4px, radius full]
  [간격 8px]
  [세그먼트2: 비어있음(border color), height 4px, radius full]
[간격 8px]
["1단계 · 기본 정보 입력" — 12px, success green]

[간격 24px]
["기본 정보 입력" — 24px bold white]
[간격 4px]
["MatchLog에서 사용할 정보를 입력해주세요" — 14px muted]

[간격 24px]
[프로필 사진 업로드 영역 — 가로 배치]
  [원형 아바타 80x80, bg surface, 중앙 카메라 아이콘 24px muted]
  [간격 16px]
  ["프로필 사진 (선택)" 14px white / "JPG, PNG · 최대 5MB" 12px muted, 2줄]

[간격 24px]
["이름" 라벨] → [입력 필드, empty 상태]
[간격 20px]
["이메일" 라벨] → [입력 필드, filled 상태] → [✓ 사용 가능한 이메일이에요 — success]
[간격 20px]
["비밀번호" 라벨] → [입력 필드, filled/masked 상태] → [✓ 사용 가능한 비밀번호에요 — success]
[간격 20px]
["비밀번호 확인" 라벨] → [입력 필드, filled/masked 상태]

[간격 32px]
[다음 버튼 — full width, height 52px, outline, radius 12px]
[간격 24px]
["이미 계정이 있으신가요? 로그인" — 중앙 정렬]
```

### 컴포넌트 상세

**헤더 (Header)**
- height 56px, 좌우 padding 20px, 배경 background와 동일(구분선 없음)
- 좌측: 뒤로가기 화살표 아이콘(24px, white), 클릭 시 이전 단계 또는 이전 화면으로 이동
- 아이콘 옆 12px 간격 후 "회원가입" 18px bold white

**진행바 (StepProgress)**
- 전체 스텝 수만큼 세그먼트 생성 (현재는 2단계 중 1단계)
- 세그먼트: height 4px, radius full(pill), 세그먼트 간 gap 8px
- **현재 단계에 해당하는 세그먼트만** success/primary green 채움 (누적 채움 아님 — 2단계에서는 1번 세그먼트가 다시 muted로 바뀌고 2번만 green)
- 나머지(이전 단계 포함) 세그먼트: 전부 border color(#3A3A3A)
- 진행바 하단에 "N단계 · [현재 단계 설명]" 텍스트, 12px, success green

**섹션 타이틀**
- 제목: 24px bold white, 좌측 정렬
- 설명: 14px muted, 상단 여백 4px

**프로필 사진 업로드 (AvatarUpload)**
- 아바타: 80×80px, radius full, 배경 surface, 클릭 가능 영역
- 아바타 내부 중앙: 카메라 아이콘(24px, muted) — 사진 없을 때 기본 상태
- 사진 선택 후에는 아이콘 대신 업로드된 이미지를 원형으로 크롭해서 표시
- 우측 텍스트: "프로필 사진 (선택)" 14px white + "JPG, PNG · 최대 5MB" 12px muted (2줄, 선택 항목임을 명시)

**입력 필드 (라벨 + Input + 상태 메시지)**
- 라벨: 14px white, 필드 상단 8px
- Input: login-design.md와 동일 스펙 (height 52px, radius 12px, bg surface, padding-left 16px)
- 상태:
  - default: 빈 값, placeholder는 muted 색상
  - filled: 값 입력됨, 텍스트 흰색
  - valid: 필드 하단에 success green 체크 아이콘 + 안내 텍스트 (12px), 여백 6px
  - invalid: 필드 하단에 error red 안내 텍스트 (예: "이미 사용 중인 이메일이에요", "비밀번호가 일치하지 않아요") — 와이어프레임엔 없지만 실제 구현 시 반드시 필요
  - focus: border 1px primary green
- "비밀번호" / "비밀번호 확인" 필드는 type="password", 눈 모양 아이콘으로 표시/숨김 토글 추가 권장 (와이어프레임엔 없지만 UX상 일반적)

**다음 버튼**
- login-design.md의 버튼 스펙과 동일 (full width, height 52px, outline, radius 12px, bold white 텍스트)
- 활성화 조건: 이름 입력 + 이메일 유효성 통과 + 비밀번호 유효성 통과 + 비밀번호 확인 일치 — 넷 다 만족해야 활성화, 아니면 disabled(opacity 50%)

**하단 로그인 링크**
- 중앙 정렬, "이미 계정이 있으신가요?" 14px muted + "로그인" 14px accent green bold underline

### 반응형
- 모바일(~430px 이하): 전체 폭, 좌우 padding 24px (헤더는 20px)
- 태블릿 이상: 콘텐츠 max-width 420px 중앙 정렬

### 인터랙션 / 상태
- 이메일: 입력 중 debounce 후 중복 확인 API 호출 → valid/invalid 표시
- 비밀번호: 최소 조건(예: 8자 이상) 충족 여부 실시간 체크 → valid/invalid 표시
- 비밀번호 확인: 비밀번호 필드와 일치 여부 실시간 체크
- 뒤로가기 클릭 시 입력 중이던 데이터는 유지한 채 이전 화면으로 (재입력 방지)
- "다음" 클릭 시 2단계로 이동, 1단계 입력값은 상위 상태(예: Context)에 보관

### 참고 컴포넌트 매핑
- Header(뒤로가기 포함) → components/layout/Header.tsx
- StepProgress → components/ui/StepProgress.tsx
- AvatarUpload → components/ui/AvatarUpload.tsx
- Input(valid/invalid 상태 포함) → components/ui/Input.tsx (login-design.md와 동일 컴포넌트, variant/상태만 확장)
- Button → components/ui/Button.tsx (login-design.md와 동일 컴포넌트 재사용)

### 참고 사항
- 이 화면은 전체 회원가입 플로우의 1단계입니다. 2단계 디자인은 이미지가 준비되면 `signup-step2-design.md`로 별도 작성 예정입니다.
- 회원가입 플로우 전체 상태(이름/이메일/비밀번호 등)는 스텝 이동 시 유지되어야 하므로, 페이지 단위가 아니라 상위 컴포넌트(또는 Context)에서 관리하는 걸 권장합니다.