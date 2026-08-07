import Link from "next/link";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { SoccerBallIcon } from "@/components/ui/icons/SoccerBallIcon";
import { LoginForm } from "@/components/login/LoginForm";
import { SocialLoginButtons } from "@/components/login/SocialLoginButtons";

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-primary">
          <SoccerBallIcon className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-4 text-[28px] font-bold text-foreground">
          MatchLog
        </h1>
        <p className="mt-2 text-sm text-muted">
          축구팀 경기 기록 & 피드백 플랫폼
        </p>
      </div>

      <div className="mt-10">
        <LoginForm />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted">또는</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-6">
        <SocialLoginButtons />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-bold text-accent underline">
          회원가입
        </Link>
      </p>
    </AuthLayout>
  );
}
