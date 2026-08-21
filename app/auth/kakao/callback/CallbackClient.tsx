"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const PROFILE_KEY = "kakao-profile";

export default function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("카카오 로그인이 취소되었습니다.");
      return;
    }
    if (!code) {
      setError("인가 코드를 받지 못했습니다.");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/kakao/callback`;

    fetch("/api/kakao/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirectUri }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "로그인에 실패했습니다.");
        return data;
      })
      .then((data) => {
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
        router.replace("/");
      })
      .catch((err: Error) => setError(err.message));
  }, [searchParams, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      {error ? (
        <>
          <p className="text-red-500">{error}</p>
          <Link href="/" className="text-sm underline">
            홈으로 돌아가기
          </Link>
        </>
      ) : (
        <p className="text-zinc-500">카카오 로그인 처리 중...</p>
      )}
    </div>
  );
}
