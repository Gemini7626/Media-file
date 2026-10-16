import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.STUDIO_CONFIG;

if (!config?.supabaseUrl || !config?.supabaseKey) {
  throw new Error("Thiếu cấu hình Supabase");
}

export const studioSupabase = createClient(
  config.supabaseUrl,
  config.supabaseKey
);

export async function getStudioSession() {
  const { data, error } =
    await studioSupabase.auth.getSession();

  if (error) throw error;

  return data.session;
}

export async function getStudioAuthHeaders() {
  const session = await getStudioSession();

  if (!session?.access_token) {
    throw new Error(
      "Bạn cần đăng nhập để sử dụng AI."
    );
  }

  return {
    Authorization: `Bearer ${session.access_token}`
  };
}

export async function getStudioRole() {
  const session = await getStudioSession();

  if (!session) return "guest";

  const { data, error } = await studioSupabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error) {
    throw new Error("Không thể kiểm tra quyền tài khoản.");
  }

  return data.role;
}
