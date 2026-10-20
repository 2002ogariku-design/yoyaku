// ログイン中の人を返す。Access が入れるヘッダーをそのまま読むだけ。
export async function onRequestGet({ request }) {
  return Response.json({
    email: request.headers.get("cf-access-authenticated-user-email") || null,
  }, { headers: { "Cache-Control": "no-store" } });
}
