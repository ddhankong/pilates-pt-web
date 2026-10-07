import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("classes")
    .select("time, class_name, bookings ( status, members ( id, name, phone ) )")
    .eq("date", todayString())
    .order("time");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const flat: { memberId: string; name: string; phone: string; className: string; time: string }[] = [];
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

  return NextResponse.json({ rows: flat });
}
