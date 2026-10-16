import { requireAdmin } from "../_auth.js";
export async function onRequestGet({ request, env }) {
  const json = (data, status = 200) =>
    Response.json(data, {
      status,
      headers: { "Cache-Control": "no-store" }
    });

  const auth = await requireAdmin(request, env);

  if (auth.error) {
    return json({ error: auth.error }, auth.status);
  }

  if (!env.REPLICATE_API_TOKEN) {
    return json({ error: "Chưa cấu hình Replicate" }, 503);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id || !/^[a-zA-Z0-9_-]{8,100}$/.test(id)) {
    return json({ error: "ID tác vụ không hợp lệ" }, 400);
  }

  try {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
          Accept: "application/json"
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return json({
        error: "Không lấy được trạng thái tác vụ"
      }, 502);
    }

    return json({
      id: result.id,
      status: result.status,
      output: result.output || null,
      error: result.error || null
    });

  } catch {
    return json({
      error: "Không kết nối được Replicate"
    }, 502);
  }
}
