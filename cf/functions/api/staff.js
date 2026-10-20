const store = (req) => new URL(req.url).searchParams.get("store") || "shibuya";
const who   = (req) => req.headers.get("cf-access-authenticated-user-email") || null;

export async function onRequestGet({ env, request }) {
  const { results } = await env.DB
    .prepare("SELECT name FROM staff WHERE store=? AND active=1 ORDER BY sort").bind(store(request)).all();
  return Response.json(results.map(r => r.name), { headers: { "Cache-Control": "no-store" } });
}

// 名簿をまるごと差し替える。順番も意味を持つので、送られた配列をそのまま正とする。
export async function onRequestPost({ env, request }) {
  let names;
  try { names = await request.json(); } catch (e) { return new Response("JSONが不正です", { status: 400 }); }
  if (!Array.isArray(names)) return new Response("配列を送ってください", { status: 400 });
  names = names.map(n => String(n || "").trim()).filter(Boolean);
  if (names.length > 200) return new Response("名簿が多すぎます", { status: 400 });

  const st = store(request), email = who(request), at = new Date().toISOString();
  const stmts = [env.DB.prepare("DELETE FROM staff WHERE store=?").bind(st)];
  names.forEach((n, i) =>
    stmts.push(env.DB.prepare("INSERT OR REPLACE INTO staff (store,name,sort,active) VALUES (?,?,?,1)").bind(st, n, i)));
  stmts.push(env.DB.prepare("INSERT INTO audit (at,who,store,action,detail) VALUES (?,?,?,?,?)")
    .bind(at, email, st, "staff.save", names.length + "名"));
  await env.DB.batch(stmts);
  return Response.json({ ok: true, count: names.length });
}
