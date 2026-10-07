import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("status, classes ( date, time, class_name )")
    .eq("member_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list = (data ?? [])
    .filter((b: any) => b.classes)
    .map((b: any) => ({
      date: b.classes.date,
      time: b.classes.time?.slice(0, 5),
      className: b.classes.class_name,
      status: b.status,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({ history: list });
}
