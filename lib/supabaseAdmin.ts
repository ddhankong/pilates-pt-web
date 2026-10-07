import { createClient } from "@supabase/supabase-js";

// 서버에서만 쓴다 — service role 키는 RLS를 건너뛴다. 클라이언트 번들에 절대 들어가면 안 된다.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
