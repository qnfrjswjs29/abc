"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        authorize: (options: { redirectUri: string }) => void;
      };
    };
  }
}

type KakaoProfile = {
  id: number;
  nickname: string;
  profileImage: string | null;
};

const PROFILE_KEY = "kakao-profile";

export default function KakaoLoginButton() {
  const [profile, setProfile] = useState<KakaoProfile | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return;
    try {
      setProfile(JSON.parse(raw));
    } catch {
      window.localStorage.removeItem(PROFILE_KEY);
    }
  }, []);

  function initKakao() {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "");
    }
    setSdkReady(true);
  }

  function handleLogin() {
    if (!window.Kakao) return;
    window.Kakao.Auth.authorize({
      redirectUri: `${window.location.origin}/auth/kakao/callback`,
    });
  }

  function handleLogout() {
    window.localStorage.removeItem(PROFILE_KEY);
    setProfile(null);
  }

  return (
    <>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.8.2/kakao.min.js"
        crossOrigin="anonymous"
        onLoad={initKakao}
      />
      <div className="mb-4 flex w-full max-w-3xl items-center justify-end">
        {profile ? (
          <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow dark:bg-black/70">
            {profile.profileImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profileImage} alt="" className="h-6 w-6 rounded-full" />
            )}
            <span className="text-sm text-black dark:text-zinc-50">{profile.nickname}님</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-zinc-500 hover:text-red-500"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogin}
            disabled={!sdkReady}
            className="flex items-center gap-2 rounded-md bg-[#FEE500] px-4 py-2 text-sm font-medium text-black/85 shadow hover:brightness-95 disabled:opacity-50"
          >
            카카오 로그인
          </button>
        )}
      </div>
    </>
  );
}
