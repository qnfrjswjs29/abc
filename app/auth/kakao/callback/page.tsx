import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-8 text-zinc-500">
          카카오 로그인 처리 중...
        </div>
      }
    >
      <CallbackClient />
    </Suspense>
  );
}
