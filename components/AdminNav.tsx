"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { label: "오늘 수업", href: "/admin/today" },
  { label: "월간", href: "/admin/month" },
  { label: "알림판", href: "/admin/notice" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="w-[160px] shrink-0 border-r border-[#E4E8EC] bg-white p-4">
      <div className="mb-4 border-b border-[#E4E8EC] pb-3 font-serif text-sm font-semibold">
        필라테스·PT
        <br />
        예약
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                "rounded-md px-2 py-2 text-sm " +
                (active ? "bg-[#C9702F1F] font-bold text-[#C9702F]" : "text-[#5B6169]")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-4 block w-full border-t border-[#E4E8EC] pt-3 text-left text-sm text-[#5B6169]"
      >
        로그아웃
      </button>
    </aside>
  );
}
