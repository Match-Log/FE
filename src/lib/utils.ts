import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

/**
 * 아바타에 표시할 이름 두 글자.
 * 한글 이름이 3글자 이상이면 성을 빼고 뒤 두 글자(오세찬 → 세찬), 그 외에는 앞 두 글자.
 */
export function getNameInitials(name?: string | null): string {
  const trimmed = (name ?? '').replace(/\s+/g, '');
  if (!trimmed) return '?';
  if (/^[가-힣]+$/.test(trimmed) && trimmed.length >= 3) return trimmed.slice(-2);
  return trimmed.slice(0, 2).toUpperCase();
}

/** axios 에러에서 HTTP status만 꺼낸다. */
export function getErrorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

/** 404면 null로 바꾼다. "아직 작성되지 않음"을 404로 주는 API용. */
export async function nullIfNotFound<T>(promise: Promise<{ data: T }>): Promise<T | null> {
  try {
    return (await promise).data;
  } catch (err) {
    if (getErrorStatus(err) === 404) return null;
    throw err;
  }
}

/** BE ErrorResponse({ error: { code, message } })의 message. 없으면 fallback. */
export function getErrorMessage(err: unknown, fallback: string): string {
  const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
  return msg || fallback;
}
