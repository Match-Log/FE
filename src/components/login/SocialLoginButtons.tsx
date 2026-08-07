"use client";

import { useState } from "react";

import { GoogleIcon } from "@/components/ui/icons/GoogleIcon";
import { KakaoIcon } from "@/components/ui/icons/KakaoIcon";
import { SocialButton } from "@/components/ui/SocialButton";

type Provider = "google" | "kakao";

export function SocialLoginButtons() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(
    null
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <SocialButton
        icon={<GoogleIcon />}
        label="Google"
        loading={loadingProvider === "google"}
        disabled={loadingProvider !== null && loadingProvider !== "google"}
        onClick={() => setLoadingProvider("google")}
      />
      <SocialButton
        icon={<KakaoIcon />}
        label="Kakao"
        loading={loadingProvider === "kakao"}
        disabled={loadingProvider !== null && loadingProvider !== "kakao"}
        onClick={() => setLoadingProvider("kakao")}
      />
    </div>
  );
}
