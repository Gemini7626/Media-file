import { requireAdmin } from "../_auth.js";
const json = (data, status = 200) =>
  Response.json(data, { status });

export async function onRequestPost({ request, env }) {
  try {
    const auth = await requireAdmin(request, env);

    if (auth.error) {
      return json({ error: auth.error }, auth.status);
    }

    if (!env.REPLICATE_API_TOKEN) {
      return json({ error: "Chưa cấu hình Replicate" }, 503);
    }

    const form = await request.formData();
    const file = form.get("image");
    const prompt = String(form.get("prompt") || "").trim();

    if (!(file instanceof File)) {
      return json({ error: "Hãy chọn ảnh nguồn" }, 400);
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return json({ error: "Chỉ hỗ trợ JPG, PNG, WebP" }, 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return json({ error: "Ảnh tối đa 5 MB" }, 413);
    }

    if (prompt.length < 3 || prompt.length > 2000) {
      return json({ error: "Prompt không hợp lệ" }, 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";

    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }

    const image = `data:${file.type};base64,${btoa(binary)}`;

    const response = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: {
            prompt,
            input_image: image,
            output_format: "jpg"
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return json({
        error: "Replicate từ chối yêu cầu",
        details: result.detail || result.error || null
      }, response.status >= 500 ? 502 : 400);
    }

    return json({
      id: result.id,
      status: result.status,
      output: result.output || null
    }, 202);

  } catch (error) {
    return json({
      error: "Không thể xử lý ảnh"
    }, 500);
  }
}
