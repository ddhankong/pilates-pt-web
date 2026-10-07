import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, adminCookieOptions, adminSessionValue } from "@/lib/adminAuth";

const ADMIN_EMAIL = "owner@pt-booking.kr";
const ADMIN_PASSWORD = "pilates2026";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 맞지 않습니다" }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, adminSessionValue(), adminCookieOptions());

  return NextResponse.json({ ok: true });
}
