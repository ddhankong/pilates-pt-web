"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "owner@pt-booking.kr";
const ADMIN_PASSWORD = "pilates2026";
const LAST_LOGIN_KEY = "pt_admin_last_login";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLastLogin(localStorage.getItem(LAST_LOGIN_KEY));
  }, []);

  function handleSubmit() {
    setSubmitting(true);
    setFailed(false);
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem(LAST_LOGIN_KEY, email);
        router.push("/admin/today");
      } else {
        setFailed(true);
        setSubmitting(false);
      }
    }, 200);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F8F5] px-4">
      <div className="w-full max-w-[300px] rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-1 font-serif text-lg font-semibold text-[#1E2328]">필라테스·PT 예약</div>
        <div className="mb-4 text-xs text-[#5B6169]">운영자 로그인</div>

        {failed && (
          <div className="mb-3 rounded-md bg-[#F0E4DD] px-3 py-2 text-xs text-[#9A5A38]">
            아이디 또는 비밀번호가 맞지 않습니다
          </div>
        )}

        <label className="mb-1 block text-xs font-semibold text-[#5B6169]">아이디</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-md border border-[#E4E8EC] bg-[#F4F8F5] px-2.5 py-2 text-sm text-[#1E2328]"
        />

        <label className="mb-1 block text-xs font-semibold text-[#5B6169]">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="mb-3 w-full rounded-md border border-[#E4E8EC] bg-[#F4F8F5] px-2.5 py-2 text-sm text-[#1E2328]"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-md bg-[#C9702F] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          로그인
        </button>

        {lastLogin && (
          <button
            onClick={() => setEmail(lastLogin)}
            className="mt-3 flex items-center gap-1.5 text-xs text-[#5B6169]"
          >
            최근 로그인
            <span className="rounded-full border border-dashed border-[#E4E8EC] px-2 py-0.5 font-mono text-[11px]">
              {lastLogin}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
