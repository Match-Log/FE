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
