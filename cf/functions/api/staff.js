export async function onRequestGet({ env, request }) {
  const st = new URL(request.url).searchParams.get("store") || "shibuya";
  const { results } = await env.DB
    .prepare("SELECT name FROM staff WHERE store=? AND active=1 ORDER BY sort").bind(st).all();
  return Response.json(results.map(r => r.name), { headers: { "Cache-Control": "no-store" } });
}
