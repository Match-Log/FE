# MatchLog-FE

## 프로젝트 개요
스포츠 매치 기록/관리 웹 앱. 경기 결과 기록, 히스토리 조회 기능.

## 기술 스택
- Next.js (App Router), TypeScript (strict)
- TailwindCSS
- ESLint, Prettier

## 명령어
- npm run dev — 로컬 서버 (:3000)
- npm run build — 프로덕션 빌드
- npm run lint — 린트 검사
- npm run type-check — 타입 검사

## 폴더 구조
src/
  app/            # 라우팅 전용, 로직 없음
  components/
    ui/           # 범용 컴포넌트
    layout/       # Header, Footer, Sidebar
    [feature]/    # 도메인별 컴포넌트
  hooks/          # use-xxx.ts
  lib/            # 순수 유틸 함수
  services/       # API 호출 로직
  types/          # 전역 타입
  constants/      # 상수, enum

## 코딩 규칙
- 컴포넌트/파일 PascalCase, 훅 useXxx, 상수 UPPER_SNAKE_CASE, 라우트 폴더 kebab-case
- 함수형 컴포넌트만, 파일당 컴포넌트 1개
- 기본 Server Component, 상태/이벤트 필요할 때만 'use client'
- Props 타입은 같은 파일에 정의, 공유 타입만 types/로 분리
- import는 절대경로(@/) 사용, ../../.. 금지
- Tailwind만 사용, 인라인 style 금지, 조건부 클래스는 clsx/cn
- API 호출은 services/ 경유, 컴포넌트에서 직접 fetch 금지
- 컴포넌트 150줄 넘으면 분리 검토

## 화면 구현 규칙
- 화면/페이지를 새로 만들거나 수정할 때는 먼저 docs/ 폴더에 해당 화면 이름의 *-design.md 파일이 있는지 확인한다.
- 있으면 그 문서의 레이아웃, 색상, spacing, 상태(hover/disabled/error 등) 사양을 반드시 따른다.
- design.md에 명시 안 된 부분은 CLAUDE.md의 코딩 규칙(폴더 구조, 네이밍 등)을 기본으로 적용한다.
- design.md 파일명 규칙: [화면명]-design.md (예: login-design.md, signup-design.md, home-design.md)

## Git / 브랜치 전략
- main: 배포 브랜치, 직접 push 금지 (PR 필수)
- 브랜치명: feature/기능명, fix/버그명
- 커밋 메시지: "타입: 설명" (예: feat: 매치 카드 컴포넌트 추가)

## 환경 변수
- .env.local 사용, 절대 커밋 금지
- 필요 변수: NEXT_PUBLIC_API_URL 등 (진행하며 추가)

## 주의사항
- node_modules, .next, .env* 커밋 금지
- package.json 의존성 버전 임의 변경 금지, 변경 필요시 먼저 확인
- 디자인은 .claude/docs/design.md와 참고 이미지 기준으로 구현, 임의 추측 금지
- 새 컴포넌트 만들기 전 component-inventory.md에서 기존 것 있는지 확인
