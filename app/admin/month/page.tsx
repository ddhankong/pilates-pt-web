"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminNav from "@/components/AdminNav";

type ClassRow = {
  date: string;
  time: string;
  class_name: string;
  capacity: number;
  booked: number;
  names: string[];
};

function toDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];

export default function MonthPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [byDate, setByDate] = useState<Record<string, ClassRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = toDateString(today);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const monthStartStr = toDateString(monthStart);
  const monthEndStr = toDateString(monthEnd);

  useEffect(() => {
    setSelectedDate(null);
    load();
  }, [year, month]);

  async function load() {
    setLoading(true);
    setLoadError(false);
    const { data, error } = await supabase
      .from("classes")
      .select("date, time, class_name, capacity, bookings ( status, members ( name ) )")
      .gte("date", monthStartStr)
      .lte("date", monthEndStr)
      .order("date")
      .order("time");

    if (error) {
      setLoadError(true);
      setLoading(false);
      return;
    }

    const grouped: Record<string, ClassRow[]> = {};
    for (const c of data ?? []) {
      const activeBookings = (c.bookings ?? []).filter((b: any) => b.status !== "취소");
      const row: ClassRow = {
        date: c.date,
        time: c.time?.slice(0, 5),
        class_name: c.class_name,
        capacity: c.capacity,
        booked: activeBookings.length,
        names: activeBookings.map((b: any) => b.members?.name).filter(Boolean),
      };
      grouped[c.date] = grouped[c.date] ?? [];
      grouped[c.date].push(row);
    }
    setByDate(grouped);
    setLoading(false);
  }

  function goPrevMonth() {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  }

  function goNextMonth() {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  }

  const totalClasses = Object.values(byDate).reduce((n, arr) => n + arr.length, 0);

  // 달력 칸 구성 — 일요일 시작, 앞뒤 빈 칸 포함
  const firstWeekday = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedRows = selectedDate ? byDate[selectedDate] ?? [] : [];

  return (
    <div className="flex min-h-screen bg-[#F4F8F5] text-[#1E2328]">
      <AdminNav />

      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={goPrevMonth}
            className="rounded-md border border-[#E4E8EC] bg-white px-2.5 py-1 text-sm text-[#5B6169]"
          >
            ◀
          </button>
          <h1 className="text-lg font-semibold">
            {year}년 {month + 1}월
          </h1>
          <button
            onClick={goNextMonth}
            className="rounded-md border border-[#E4E8EC] bg-white px-2.5 py-1 text-sm text-[#5B6169]"
          >
            ▶
          </button>
        </div>

        {loading ? (
          <div className="rounded-lg border border-[#E4E8EC] bg-white p-8 text-center text-sm text-[#5B6169]">
            불러오는 중...
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-[#E4E8EC] bg-white p-4 text-sm text-[#9A5A38]">
            문제가 생겼습니다.{" "}
            <button onClick={load} className="underline">
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-[#E4E8EC] bg-white">
              <div className="grid grid-cols-7 border-b border-[#E4E8EC] bg-[#F4F8F5]">
                {weekdayNames.map((w) => (
                  <div key={w} className="py-2 text-center text-xs font-semibold text-[#5B6169]">
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                  if (day === null) {
                    return <div key={i} className="min-h-[84px] border-b border-r border-[#E4E8EC]" />;
                  }
                  const dateStr = toDateString(new Date(year, month, day));
                  const rows = byDate[dateStr] ?? [];
                  const totalBooked = rows.reduce((n, r) => n + r.booked, 0);
                  const totalCapacity = rows.reduce((n, r) => n + r.capacity, 0);
                  const full = rows.length > 0 && totalBooked >= totalCapacity;
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  return (
                    <button
                      key={i}
                      onClick={() => rows.length > 0 && setSelectedDate(isSelected ? null : dateStr)}
                      className={
                        "min-h-[84px] border-b border-r border-[#E4E8EC] p-1.5 text-left align-top " +
                        (isToday ? "border-2 border-[#C9702F]" : "") +
                        (isSelected ? " bg-[#C9702F1F]" : "")
                      }
                    >
                      <div className="text-sm font-semibold">{day}</div>
                      {rows.length > 0 && (
                        <div className={"mt-1 text-sm " + (full ? "font-bold text-[#9A5A38]" : "text-[#5B6169]")}>
                          {rows.length}건 · {totalBooked}/{totalCapacity}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {totalClasses === 0 && (
              <div className="mt-3 rounded-lg border border-[#E4E8EC] bg-white p-6 text-center text-sm text-[#5B6169]">
                이번 달은 열리는 수업이 없습니다
              </div>
            )}

            {selectedDate && selectedRows.length > 0 && (
              <div className="mt-4 rounded-lg border border-[#E4E8EC] bg-white p-4">
                <div className="mb-2 text-sm font-semibold">
                  {month + 1}월 {Number(selectedDate.split("-")[2])}일
                </div>
                {selectedRows.map((r, i) => {
                  const full = r.booked >= r.capacity;
                  return (
                    <div key={i} className="border-t border-dashed border-[#E4E8EC] py-1.5 first:border-t-0">
                      <div className="flex justify-between text-sm">
                        <span>
                          {r.time} {r.class_name}
                        </span>
                        <span className={full ? "font-bold text-[#9A5A38]" : "text-[#5B6169]"}>
                          {r.booked}/{r.capacity}
                        </span>
                      </div>
                      {r.names.length > 0 && (
                        <div className="mt-1 text-sm text-[#5B6169]">{r.names.join(", ")}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
