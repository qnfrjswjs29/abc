import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { code, redirectUri } = await request.json();

  if (!code || !redirectUri) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const restApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  if (!restApiKey) {
    return NextResponse.json(
      { error: "카카오 REST API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: restApiKey,
      redirect_uri: redirectUri,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: tokenData.error_description ?? "토큰 발급에 실패했습니다." },
      { status: 400 }
    );
  }

  const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profileData = await profileRes.json();
  if (!profileRes.ok) {
    return NextResponse.json({ error: "프로필 조회에 실패했습니다." }, { status: 400 });
  }

  const profile = profileData.kakao_account?.profile ?? {};

  return NextResponse.json({
    id: profileData.id,
    nickname: profile.nickname ?? "카카오 사용자",
    profileImage: profile.profile_image_url ?? null,
  });
}
