// 소셜 로그인(Google/Kakao) authorize URL 조립.
// 백엔드가 Authorization Code Flow를 쓰므로, FE는 provider로 리다이렉트해 code만 받아오고
// 교환은 백엔드(POST /api/v1/auth/oauth/{provider})에서 처리한다.

export type OAuthProvider = 'google' | 'kakao';

interface OAuthProviderConfig {
  authorizeUrl: string;
  clientId: string | undefined;
  redirectUri: string | undefined;
  scope?: string;
}

const OAUTH_CONFIG: Record<OAuthProvider, OAuthProviderConfig> = {
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
    scope: 'openid email profile',
  },
  kakao: {
    authorizeUrl: 'https://kauth.kakao.com/oauth/authorize',
    clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID, // Kakao REST API 키
    redirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI,
  },
};

export function buildOAuthAuthorizeUrl(provider: OAuthProvider): string {
  const config = OAUTH_CONFIG[provider];

  if (!config.clientId || !config.redirectUri) {
    throw new Error(
      `${provider} OAuth 환경변수가 설정되지 않았습니다. .env의 NEXT_PUBLIC_${provider.toUpperCase()}_CLIENT_ID / NEXT_PUBLIC_${provider.toUpperCase()}_REDIRECT_URI를 확인하세요.`
    );
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
  });
  if (config.scope) params.set('scope', config.scope);

  return `${config.authorizeUrl}?${params.toString()}`;
}
