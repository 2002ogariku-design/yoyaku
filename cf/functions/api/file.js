// 大きいファイル（取り置きのExcelなど）を R2 に置く。
// D1 は1行2MBまでなので、それを超えるものはこちら。
const who = (req) => req.headers.get("cf-access-authenticated-user-email") || null;
const keyOf = (url) => {
  const store = url.searchParams.get("store") || "shibuya";
  const name  = (url.searchParams.get("name") || "").replace(/[^A-Za-z0-9._-]/g, "");
  return name ? `${store}/${name}.json` : null;
};

export async function onRequestGet({ env, request }) {
  const key = keyOf(new URL(request.url));
  if (!key) return new Response("name は必須です", { status: 400 });
  const obj = await env.FILES.get(key);
  if (!obj) return Response.json(null, { headers: { "Cache-Control": "no-store" } });
  return new Response(obj.body, {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost({ env, request }) {
  const url = new URL(request.url), key = keyOf(url);
  if (!key) return new Response("name は必須です", { status: 400 });
  const body = await request.text();
  if (body.length > 90_000_000) return new Response("ファイルが大きすぎます", { status: 413 });
  const email = who(request), at = new Date().toISOString();
  await env.FILES.put(key, body, {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
    customMetadata: { savedBy: email || "", savedAt: at },
  });
  try {
    await env.DB.prepare("INSERT INTO audit (at,who,store,action,detail) VALUES (?,?,?,?,?)")
      .bind(at, email, url.searchParams.get("store") || "shibuya", "file.save",
            key + " / " + Math.round(body.length / 1024) + "KB").run();
  } catch (e) {}
  return Response.json({ ok: true, size: body.length });
}
