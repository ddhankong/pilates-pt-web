"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminNav from "@/components/AdminNav";

type TodayRow = {
  memberId: string;
  name: string;
  phone: string;
  className: string;
  time: string;
};

type HistoryRow = {
  date: string;
  time: string;
  className: string;
  status: string;
};

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatHistoryDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}/${d.getDate()}(${weekdayNames[d.getDay()]})`;
}

export default function TodayPage() {
  const [rows, setRows] = useState<TodayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      })
    );
    loadToday();
  }, []);

  async function loadToday() {
    setLoading(true);
    setLoadError(false);
    const { data, error } = await supabase
      .from("classes")
      .select("time, class_name, bookings ( status, members ( id, name, phone ) )")
      .eq("date", todayString())
      .order("time");

    if (error) {
      console.error("오늘 수업 불러오기 실패:", error);
      setLoadError(true);
      setLoading(false);
      return;
    }

    const flat: TodayRow[] = [];
    for (const cls of data ?? []) {
      for (const b of (cls as any).bookings ?? []) {
        if (b.status === "취소" || !b.members) continue;
        flat.push({
          memberId: b.members.id,
          name: b.members.name,
          phone: b.members.phone,
          className: (cls as any).class_name,
          time: (cls as any).time?.slice(0, 5),
        });
      }
    }
    flat.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    setRows(flat);
    setLoading(false);
  }

  async function openMember(memberId: string, name: string, phone: string) {
    setSelectedMemberId(memberId);
    setSelectedName(name);
    setSelectedPhone(phone);
    const { data } = await supabase
      .from("bookings")
      .select("status, classes ( date, time, class_name )")
      .eq("member_id", memberId);

    const list: HistoryRow[] = (data ?? [])
      .filter((b: any) => b.classes)
      .map((b: any) => ({
        date: b.classes.date,
        time: b.classes.time?.slice(0, 5),
        className: b.classes.class_name,
        status: b.status,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    setHistory(list);
  }

  const filtered = rows.filter((b) => b.name.includes(query.trim()));

  return (
    <div className="flex min-h-screen bg-[#F4F8F5] text-[#1E2328]">
      {selectedMemberId && (
        <div className="fixed inset-0 z-10" onClick={() => setSelectedMemberId(null)} />
      )}

      <AdminNav />

      <main className="flex-1 p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h1 className="text-lg font-semibold">오늘 수업</h1>
          <span className="text-xs text-[#5B6169]">{today}</span>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 이름으로 찾기"
          className="mb-3 w-[220px] rounded-md border-2 border-[#E4E8EC] bg-[#F4F8F5] px-3 py-1.5 text-sm text-[#1E2328] placeholder:text-[#5B6169]"
        />

        {loading ? (
          <div className="rounded-lg border border-[#E4E8EC] bg-white p-8 text-center text-sm text-[#5B6169]">
            불러오는 중...
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-[#E4E8EC] bg-white p-4 text-sm text-[#9A5A38]">
            문제가 생겼습니다.{" "}
            <button onClick={loadToday} className="underline">
              다시 시도
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-[#E4E8EC] bg-white p-8 text-center text-sm text-[#5B6169]">
            오늘은 예정된 수업이 없습니다
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-[#E4E8EC] bg-white p-8 text-center text-sm text-[#5B6169]">
            찾는 사람이 없습니다
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-[#E4E8EC] px-2 py-2 text-left text-xs font-semibold uppercase text-[#5B6169]">
                  이름
                </th>
                <th className="border-b border-[#E4E8EC] px-2 py-2 text-left text-xs font-semibold uppercase text-[#5B6169]">
                  수업
                </th>
                <th className="border-b border-[#E4E8EC] px-2 py-2 text-left text-xs font-semibold uppercase text-[#5B6169]">
                  시간
                </th>
                <th className="border-b border-[#E4E8EC] px-2 py-2 text-left text-xs font-semibold uppercase text-[#5B6169]">
                  연락처
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={i}>
                  <td className="border-b border-[#E4E8EC] px-2 py-2">
                    <button
                      onClick={() => openMember(b.memberId, b.name, b.phone)}
                      className="text-left text-[#C9702F] underline-offset-2 hover:underline"
                    >
                      {b.name}
                    </button>
                  </td>
                  <td className="border-b border-[#E4E8EC] px-2 py-2">{b.className}</td>
                  <td className="border-b border-[#E4E8EC] px-2 py-2">{b.time}</td>
                  <td className="border-b border-[#E4E8EC] px-2 py-2">{b.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {selectedMemberId && (
        <aside
          className="fixed right-0 top-0 z-20 h-full w-[280px] border-l border-[#E4E8EC] bg-white p-4 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-start justify-between border-b border-[#E4E8EC] pb-3">
            <div>
              <div className="font-semibold">{selectedName}</div>
              <div className="text-xs text-[#5B6169]">{selectedPhone}</div>
            </div>
            <button
              onClick={() => setSelectedMemberId(null)}
              className="text-[#5B6169]"
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          <div className="mb-2 text-xs font-semibold uppercase text-[#5B6169]">
            신청 기록 (최신순)
          </div>

          {history.length === 0 ? (
            <div className="text-sm text-[#5B6169]">다른 신청 기록이 없습니다</div>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {history.map((b, i) => (
                <li key={i} className="border-b border-dashed border-[#E4E8EC] pb-2">
                  <div className="text-xs text-[#5B6169]">
                    {formatHistoryDate(b.date)} {b.time}
                  </div>
                  <div className="flex justify-between">
                    <span>{b.className}</span>
                    <span className="text-[#C9702F]">{b.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </div>
  );
}
