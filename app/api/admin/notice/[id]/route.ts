import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, body } = await req.json();
  const trimmedTitle = String(title ?? "").trim();
  if (!trimmedTitle) {
    return NextResponse.json({ error: "제목이 비었습니다" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("notices")
    .update({ title: trimmedTitle, body: String(body ?? "").trim() || null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { error } = await supabaseAdmin.from("notices").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
