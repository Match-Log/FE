"use client";

import { useCallback, useState } from "react";

import { login } from "@/services/authService";
import type { LoginRequest } from "@/types/auth";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(payload);
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { submit, isLoading, error };
}
