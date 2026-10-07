import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function toDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(req: NextRequest) {
  const year = Number(req.nextUrl.searchParams.get("year"));
  const month = Number(req.nextUrl.searchParams.get("month")); // 1-indexed

  if (!year || !month) {
    return NextResponse.json({ error: "year, month가 필요합니다" }, { status: 400 });
  }

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  const { data, error } = await supabaseAdmin
    .from("classes")
    .select("date, time, class_name, capacity, bookings ( status, members ( name ) )")
    .gte("date", toDateString(monthStart))
    .lte("date", toDateString(monthEnd))
    .order("date")
    .order("time");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const grouped: Record<
    string,
    { date: string; time: string; class_name: string; capacity: number; booked: number; names: string[] }[]
  > = {};

  for (const c of data ?? []) {
    const activeBookings = ((c as any).bookings ?? []).filter((b: any) => b.status !== "취소");
    const row = {
      date: (c as any).date,
      time: (c as any).time?.slice(0, 5),
      class_name: (c as any).class_name,
      capacity: (c as any).capacity,
      booked: activeBookings.length,
      names: activeBookings.map((b: any) => b.members?.name).filter(Boolean),
    };
    grouped[row.date] = grouped[row.date] ?? [];
    grouped[row.date].push(row);
  }

  return NextResponse.json({ byDate: grouped });
}
