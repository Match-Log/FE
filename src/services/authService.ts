import type { LoginRequest, LoginResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다");
  }

  return response.json() as Promise<LoginResponse>;
}
