// BE 공통 에러 응답은 `{ error: { code, message } }` 형태로 중첩돼 온다 (dto/common/ErrorResponse).
// axios 에러(unknown)에서 그 code/message를 안전하게 꺼내고, 알려진 코드는 사용자 친화 문구로 매핑한다.

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

function getErrorDetail(err: unknown): { code?: string; message?: string } {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: ApiErrorBody } }).response?.data;
    return { code: data?.error?.code, message: data?.error?.message };
  }
  return {};
}

export function getApiErrorCode(err: unknown): string | undefined {
  return getErrorDetail(err).code;
}

// 알려진 에러 코드는 상황을 더 명확히 안내하는 문구로 덮어쓴다.
const CODE_MESSAGE: Record<string, string> = {
  PROVIDER_MISMATCH:
    '이미 다른 방식(이메일 또는 다른 소셜 계정)으로 가입된 이메일이에요. 기존 로그인 방식으로 로그인해주세요.',
  INVALID_OAUTH_CODE: '인증이 만료되었거나 유효하지 않아요. 다시 시도해주세요.',
};

// 우선순위: 알려진 코드 매핑 > BE 실제 message > fallback
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const { code, message } = getErrorDetail(err);
  if (code && CODE_MESSAGE[code]) return CODE_MESSAGE[code];
  return message || fallback;
}
