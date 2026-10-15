const MODELS = {
  "flux-schnell": "black-forest-labs/flux-schnell",
  "flux-dev": "black-forest-labs/flux-dev"
};

export async function onRequestPost({ request, env }) {
  const json = (data, status = 200) =>
    Response.json(data, {
      status,
      headers: { "Cache-Control": "no-store" }
    });

  // Chưa mở API trả phí khi chưa có xác thực phía máy chủ.
  const expected = env.STUDIO_ACCESS_TOKEN;
  const supplied = request.headers.get("X-Studio-Token");

  if (!expected || !supplied || supplied !== expected) {
    return json({ error: "Chưa được cấp quyền tạo ảnh" }, 401);
  }

  if (!env.REPLICATE_API_TOKEN) {
    return json({ error: "Chưa cấu hình Replicate API" }, 503);
  }

  try {
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    const model = MODELS[body.model || "flux-schnell"];

    if (prompt.length < 3 || prompt.length > 2000) {
      return json({ error: "Prompt phải dài từ 3 đến 2000 ký tự" }, 400);
    }

    if (!model) {
      return json({ error: "Model không được hỗ trợ" }, 400);
    }

    const ratios = ["1:1", "2:3", "3:2", "9:16", "16:9"];
    const ratio = ratios.includes(body.aspect_ratio)
      ? body.aspect_ratio
      : "1:1";

    const input = {
      prompt,
      aspect_ratio: ratio,
      output_format: "webp"
    };

    if (model.endsWith("flux-schnell")) {
      input.num_outputs = 1;
    }

    const response = await fetch(
      `https://api.replicate.com/v1/models/${model}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input })
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
    return json({ error: "Không xử lý được yêu cầu tạo ảnh" }, 500);
  }
}
