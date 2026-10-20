// 任意のJSONをツール単位で保存する汎用API（ピッキングのリストなど）。
// ツールごとに行が分かれるので、別のリストを同時に触っても競合しない。
const store = (req) => new URL(req.url).searchParams.get("store") || "shibuya";
const who   = (req) => req.headers.get("cf-access-authenticated-user-email") || null;
const parse = (s) => { try { return JSON.parse(s); } catch (e) { return null; } };

export async function onRequestGet({ env, request }) {
  const u = new URL(request.url), st = store(request), tool = u.searchParams.get("tool");
  if (tool) {
    const row = await env.DB.prepare("SELECT data FROM kv WHERE store=? AND tool=?").bind(st, tool).first();
    return Response.json(row ? parse(row.data) : null, { headers: { "Cache-Control": "no-store" } });
  }
  const { results } = await env.DB.prepare("SELECT tool, data FROM kv WHERE store=?").bind(st).all();
  const out = {};
  for (const r of results) out[r.tool] = parse(r.data);
  return Response.json(out, { headers: { "Cache-Control": "no-store" } });
}

export async function onRequestPost({ env, request }) {
  const u = new URL(request.url), st = store(request), tool = u.searchParams.get("tool");
  if (!tool) return new Response("tool は必須です", { status: 400 });
  let value;
  try { value = await request.json(); } catch (e) { return new Response("JSONが不正です", { status: 400 }); }
  const email = who(request), at = new Date().toISOString();
  const body = JSON.stringify(value);
  if (body.length > 4_000_000) return new Response("データが大きすぎます", { status: 413 });
  await env.DB.batch([
    env.DB.prepare("INSERT OR REPLACE INTO kv (store,tool,data,saved_at,saved_by) VALUES (?,?,?,?,?)")
      .bind(st, tool, body, at, email),
    env.DB.prepare("INSERT INTO audit (at,who,store,action,detail) VALUES (?,?,?,?,?)")
      .bind(at, email, st, "kv.save", tool),
  ]);
  return Response.json({ ok: true });
}
