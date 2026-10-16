
export async function requireUser(request, env) {
  const SUPABASE_URL = env.SUPABASE_URL;
  if (!SUPABASE_URL) return { error: "Thiếu SUPABASE_URL", status: 503 };
  const header = request.headers.get("Authorization") || "";

  if (!header.startsWith("Bearer ")) {
    return { error: "Chưa đăng nhập", status: 401 };
  }

  const token = header.slice(7).trim();

  if (!token || !env.SUPABASE_ANON_KEY) {
    return { error: "Thiếu cấu hình xác thực", status: 503 };
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      return { error: "Phiên đăng nhập không hợp lệ", status: 401 };
    }

    const user = await response.json();

    if (!user.id) {
      return { error: "Không tìm thấy người dùng", status: 401 };
    }

    return { user };
  } catch {
    return { error: "Không kết nối được Supabase", status: 503 };
  }
}

export async function requireAdmin(request, env) {
  const auth = await requireUser(request, env);

  if (auth.error) {
    return auth;
  }

  try {
    const token = request.headers
      .get("Authorization")
      .slice(7)
      .trim();

    const url = new URL(
      `${SUPABASE_URL}/rest/v1/profiles`
    );

    url.searchParams.set("select", "role");
    url.searchParams.set("id", `eq.${auth.user.id}`);

    const response = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return {
        error: "Không thể kiểm tra quyền tài khoản",
        status: 503
      };
    }

    const profiles = await response.json();

    if (profiles[0]?.role !== "admin") {
      return {
        error: "Tài khoản không có quyền Admin",
        status: 403
      };
    }

    return {
      user: auth.user,
      role: "admin"
    };
  } catch {
    return {
      error: "Lỗi kiểm tra quyền Admin",
      status: 503
    };
  }
}
