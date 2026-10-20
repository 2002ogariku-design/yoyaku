// タスク集計のデータAPI。D1に読み書きする。
// 認証は Cloudflare Access が手前で済ませているので、ここでは鍵を扱わない。
const store = (req) => new URL(req.url).searchParams.get("store") || "shibuya";
const who   = (req) => req.headers.get("cf-access-authenticated-user-email") || null;

export async function onRequestGet({ env, request }) {
  const { results } = await env.DB
    .prepare("SELECT date, staff, data, saved_at FROM kpi WHERE store=? ORDER BY date")
    .bind(store(request)).all();
  const rows = results.map(r => {
    let d = {};
    try { d = JSON.parse(r.data) || {}; } catch (e) {}
    return { ...d, date: r.date, staff: r.staff, savedAt: r.saved_at };
  });
  return Response.json(rows, { headers: { "Cache-Control": "no-store" } });
}

export async function onRequestPost({ env, request }) {
  let entry;
  try { entry = await request.json(); } catch (e) { return new Response("JSONが不正です", { status: 400 }); }
  if (!entry || !entry.date || !entry.staff) return new Response("date と staff は必須です", { status: 400 });

  const { date, staff, savedAt, ...data } = entry;
  const st = store(request), email = who(request);
  const at = new Date().toISOString();

  await env.DB.batch([
    env.DB.prepare("INSERT OR REPLACE INTO kpi (store,date,staff,data,saved_at,saved_by) VALUES (?,?,?,?,?,?)")
      .bind(st, date, staff, JSON.stringify(data), savedAt || at, email),
    env.DB.prepare("INSERT INTO audit (at,who,store,action,detail) VALUES (?,?,?,?,?)")
      .bind(at, email, st, "kpi.save", date + " / " + staff),
  ]);
  return Response.json({ ok: true, savedBy: email });
}
