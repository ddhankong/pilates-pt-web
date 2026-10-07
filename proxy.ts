import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/adminAuth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieValue = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authed = isValidAdminSession(cookieValue);

  const isAuthRoute = pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  if (pathname.startsWith("/api/admin") && !isAuthRoute) {
    if (authed) return NextResponse.next();
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (authed) return NextResponse.next();
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
