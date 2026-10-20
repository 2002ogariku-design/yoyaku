// Supabase の app_data テーブルと同じ形で応答する互換API。
// 旧ツールは `[{payload:...}]` を前提に書かれているので、その形を保ったまま
// 保存先だけ D1 に差し替えられる。中身は /api/kv と同じ kv テーブル。
const who = (req) => req.headers.get("cf-access-authenticated-user-email") || null;
const DEFAULT_STORE = "shibuya";

// ?tool=eq.kaitori → "kaitori"
function toolOf(url) {
  const raw = url.searchParams.get("tool") || "";
  return raw.startsWith("eq.") ? raw.slice(3) : raw;
}
const storeOf = (url) => url.searchParams.get("store") || DEFAULT_STORE;

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url), tool = toolOf(url);
  if (!tool) return Response.json([], { headers: { "Cache-Control": "no-store" } });
  const row = await env.DB.prepare("SELECT data FROM kv WHERE store=? AND tool=?")
    .bind(storeOf(url), tool).first();
  if (!row) return Response.json([], { headers: { "Cache-Control": "no-store" } });
  let payload = null;
  try { payload = JSON.parse(row.data); } catch (e) {}
  return Response.json([{ tool, payload }], { headers: { "Cache-Control": "no-store" } });
}

// Supabase の upsert と同じく {tool, payload} を受ける
export async function onRequestPost({ env, request }) {
  const url = new URL(request.url);
  let body;
  try { body = await request.json(); } catch (e) { return new Response("JSONが不正です", { status: 400 }); }
  const tool = String(body.tool || toolOf(url) || "").trim();
  if (!tool) return new Response("tool は必須です", { status: 400 });
  const data = JSON.stringify(body.payload === undefined ? body : body.payload);
  if (data.length > 4_000_000) return new Response("データが大きすぎます", { status: 413 });
  const st = storeOf(url), email = who(request), at = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("INSERT OR REPLACE INTO kv (store,tool,data,saved_at,saved_by) VALUES (?,?,?,?,?)")
      .bind(st, tool, data, at, email),
    env.DB.prepare("INSERT INTO audit (at,who,store,action,detail) VALUES (?,?,?,?,?)")
      .bind(at, email, st, "sb.save", tool),
  ]);
  return new Response(null, { status: 204 });
}
