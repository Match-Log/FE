# Component Inventory

새 컴포넌트를 만들기 전에 이 목록에서 재사용 가능한 컴포넌트가 있는지 먼저 확인한다.

## ui/

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| Input | src/components/ui/Input.tsx | default/focus/error 상태를 지원하는 텍스트 입력 필드 |
| Button | src/components/ui/Button.tsx | disabled/loading 상태를 지원하는 outline 스타일 버튼 |
| SocialButton | src/components/ui/SocialButton.tsx | 아이콘 + 텍스트, loading 상태를 지원하는 소셜 로그인 버튼 |
| SoccerBallIcon | src/components/ui/icons/SoccerBallIcon.tsx | 축구공 outline 아이콘 |
| GoogleIcon | src/components/ui/icons/GoogleIcon.tsx | Google 멀티컬러 G 로고 아이콘 |
| KakaoIcon | src/components/ui/icons/KakaoIcon.tsx | Kakao 노란 말풍선 아이콘 |

## layout/

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| AuthLayout | src/components/layout/AuthLayout.tsx | 인증 화면용 세로 중앙 정렬 컨테이너, max-width 420px |

## 기능별 (feature)

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| LoginForm | src/components/login/LoginForm.tsx | 이메일/비밀번호 입력, 실시간 이메일 형식 검증, 로그인 버튼 활성화 로직, useLogin 연동 |
| SocialLoginButtons | src/components/login/SocialLoginButtons.tsx | Google/Kakao 소셜 로그인 버튼, 클릭 시 로딩 스피너 전환 |
