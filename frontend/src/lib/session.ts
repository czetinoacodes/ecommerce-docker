import type { NextResponse } from "next/server";

export function setSessionCookies(
  response: NextResponse,
  token: string,
  name: string,
  userId: number
) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60,
  };

  response.cookies.set("token", token, options);
  response.cookies.set("user_name", name, options);
  response.cookies.set("user_id", String(userId), options);
}

export function getUserNameFromAuthResponse(
  result: { name?: string; user?: { name?: string } },
  fallback: string
) {
  return result.user?.name?.trim() || result.name?.trim() || fallback;
}
