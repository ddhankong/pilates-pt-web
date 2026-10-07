import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "pt_admin_session";
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET!;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7일

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export function isValidAdminSession(value: string | undefined) {
  return !!value && value === ADMIN_SESSION_SECRET;
}

export function adminSessionValue() {
  return ADMIN_SESSION_SECRET;
}

export async function isAdminRequest() {
  const store = await cookies();
  return isValidAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value);
}
