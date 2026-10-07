import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const { title, body } = await req.json();
  const trimmedTitle = String(title ?? "").trim();
  if (!trimmedTitle) {
    return NextResponse.json({ error: "제목이 비었습니다" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("notices")
    .insert({ title: trimmedTitle, body: String(body ?? "").trim() || null });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
