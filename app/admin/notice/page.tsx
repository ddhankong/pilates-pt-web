"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminNav from "@/components/AdminNav";

type Notice = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
};

function formatNoticeDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadNotices();
  }, []);

  async function loadNotices() {
    setLoading(true);
    setLoadError(false);
    const { data, error } = await supabase
      .from("notices")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(true);
    } else {
      setNotices(data ?? []);
    }
    setLoading(false);
  }

  function resetDraft() {
    setDraftTitle("");
    setDraftBody("");
    setEditingId(null);
  }

  async function handleSubmit() {
    const title = draftTitle.trim();
    if (!title) return;
    const body = draftBody.trim() || null;

    if (editingId) {
      const { error } = await supabase.from("notices").update({ title, body }).eq("id", editingId);
      if (!error) {
        resetDraft();
        loadNotices();
      }
    } else {
      const { error } = await supabase.from("notices").insert({ title, body });
      if (!error) {
        resetDraft();
        loadNotices();
      }
    }
  }

  function handleEdit(n: Notice) {
    setEditingId(n.id);
    setDraftTitle(n.title);
    setDraftBody(n.body ?? "");
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (!error) {
      if (editingId === id) resetDraft();
      loadNotices();
    }
  }

  const [latest, ...rest] = notices;

  return (
    <div className="flex min-h-screen bg-[#F4F8F5] text-[#1E2328]">
      <AdminNav />

      <main className="flex-1 p-6">
        <h1 className="mb-4 text-lg font-semibold">알림판</h1>

        <div className="mb-4 flex flex-col gap-2">
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="rounded-md border-2 border-[#E4E8EC] bg-[#F4F8F5] px-3 py-1.5 text-sm text-[#1E2328] placeholder:text-[#5B6169]"
          />
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="본문을 입력하세요 (선택)"
            rows={3}
            className="rounded-md border-2 border-[#E4E8EC] bg-[#F4F8F5] px-3 py-1.5 text-sm text-[#1E2328] placeholder:text-[#5B6169]"
          />
          <div className="flex justify-end gap-2">
            {editingId && (
              <button
                onClick={resetDraft}
                className="rounded-md border border-[#E4E8EC] px-4 py-1.5 text-sm font-semibold text-[#5B6169]"
              >
                취소
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!draftTitle.trim()}
              className="rounded-md bg-[#C9702F] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {editingId ? "수정 완료" : "올리기"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-[#E4E8EC] bg-white p-8 text-center text-sm text-[#5B6169]">
            불러오는 중...
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-[#E4E8EC] bg-white p-4 text-sm text-[#9A5A38]">
            문제가 생겼습니다.{" "}
            <button onClick={loadNotices} className="underline">
              다시 시도
            </button>
          </div>
        ) : notices.length === 0 ? (
          <div className="rounded-lg border border-[#E4E8EC] bg-white p-8 text-center text-sm text-[#5B6169]">
            아직 올린 공지가 없습니다
          </div>
        ) : (
          <>
            <div className="mb-3 rounded-lg border border-[#C9702F] bg-[#C9702F1F] p-4">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[#C9702F]">
                최신 공지
              </div>
              <div className="mb-1 text-sm font-bold">{latest.title}</div>
              {latest.body && (
                <div className="mb-2 whitespace-pre-wrap text-sm">{latest.body}</div>
              )}
              <div className="flex gap-3 text-xs font-semibold text-[#C9702F]">
                <button onClick={() => handleEdit(latest)}>수정</button>
                <button onClick={() => handleDelete(latest.id)}>삭제</button>
              </div>
            </div>

            <ul>
              {rest.map((n) => {
                const expanded = expandedId === n.id;
                return (
                  <li key={n.id} className="border-b border-[#E4E8EC] py-2.5">
                    <button
                      onClick={() => setExpandedId(expanded ? null : n.id)}
                      className="flex w-full justify-between gap-3 text-left text-sm"
                    >
                      <span className="font-semibold">{n.title}</span>
                      <span className="whitespace-nowrap text-xs text-[#5B6169]">
                        {formatNoticeDate(n.created_at)}
                      </span>
                    </button>
                    {expanded && (
                      <div className="mt-2">
                        <div className="whitespace-pre-wrap text-sm text-[#5B6169]">
                          {n.body || "본문 없음"}
                        </div>
                        <div className="mt-2 flex gap-3 text-xs font-semibold text-[#C9702F]">
                          <button onClick={() => handleEdit(n)}>수정</button>
                          <button onClick={() => handleDelete(n.id)}>삭제</button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
