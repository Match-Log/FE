"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/hooks/use-login";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { submit, isLoading, error } = useLogin();

  const emailError =
    email.length > 0 && !EMAIL_REGEX.test(email)
      ? "올바른 이메일 형식이 아닙니다"
      : undefined;
  const isDisabled = !email || !password || Boolean(emailError);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isDisabled) return;
    submit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-3">
        <Input
          type="email"
          placeholder="이메일"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError}
        />
        <Input
          type="password"
          placeholder="비밀번호"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="mt-2 text-right">
        <Link
          href="/forgot-password"
          className="text-xs text-muted hover:text-foreground"
        >
          비밀번호를 잊으셨나요?
        </Link>
      </div>

      {error && (
        <p className="mt-3 text-center text-xs text-error">{error}</p>
      )}

      <div className="mt-4">
        <Button type="submit" disabled={isDisabled} loading={isLoading}>
          로그인
        </Button>
      </div>
    </form>
  );
}
