// 公式インスタ分析のデータAPI。インサイト（日別）と投稿を扱う。
const store = (req) => new URL(req.url).searchParams.get("store") || "shibuya";
const who   = (req) => req.headers.get("cf-access-authenticated-user-email") || null;
const parse = (s) => { try { return JSON.parse(s) || {}; } catch (e) { return {}; } };

export async function onRequestGet({ env, request }) {
  const st = store(request);
  const [ins, pos] = await env.DB.batch([
    env.DB.prepare("SELECT date, data, saved_at FROM insights WHERE store=? ORDER BY date").bind(st),
    env.DB.prepare("SELECT id, data, saved_at FROM posts WHERE store=? ORDER BY saved_at").bind(st),
  ]);
  return Response.json({
    insights: ins.results.map(r => ({ ...parse(r.data), date: r.date, savedAt: r.saved_at })),
    posts:    pos.results.map(r => ({ ...parse(r.data), id: r.id, savedAt: r.saved_at })),
  }, { headers: { "Cache-Control": "no-store" } });
}

// {kind:"insight", value:{...}} / {kind:"post", value:{...}} / {kind:"deletePost", id:"..."}
export async function onRequestPost({ env, request }) {
  let body;
  try { body = await request.json(); } catch (e) { return new Response("JSONが不正です", { status: 400 }); }
  const st = store(request), email = who(request), at = new Date().toISOString();
  const audit = (action, detail) =>
    env.DB.prepare("INSERT INTO audit (at,who,store,action,detail) VALUES (?,?,?,?,?)")
      .bind(at, email, st, action, detail);

  if (body.kind === "insight") {
    const { date, savedAt, ...data } = body.value || {};
    if (!date) return new Response("date は必須です", { status: 400 });
    await env.DB.batch([
      env.DB.prepare("INSERT OR REPLACE INTO insights (store,date,data,saved_at,saved_by) VALUES (?,?,?,?,?)")
        .bind(st, date, JSON.stringify(data), savedAt || at, email),
      audit("insta.insight", date),
    ]);
    return Response.json({ ok: true });
  }
  if (body.kind === "post") {
    const { id, savedAt, ...data } = body.value || {};
    const pid = String(id || at + "-" + Math.random().toString(36).slice(2, 8));
    await env.DB.batch([
      env.DB.prepare("INSERT OR REPLACE INTO posts (store,id,data,saved_at,saved_by) VALUES (?,?,?,?,?)")
        .bind(st, pid, JSON.stringify(data), savedAt || at, email),
      audit("insta.post", pid),
    ]);
    return Response.json({ ok: true, id: pid });
  }
  if (body.kind === "deletePost") {
    if (!body.id) return new Response("id は必須です", { status: 400 });
    await env.DB.batch([
      env.DB.prepare("DELETE FROM posts WHERE store=? AND id=?").bind(st, String(body.id)),
      audit("insta.deletePost", String(body.id)),
    ]);
    return Response.json({ ok: true });
  }
  return new Response("kind が不正です", { status: 400 });
}
