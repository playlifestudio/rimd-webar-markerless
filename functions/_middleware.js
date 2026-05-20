// Cloudflare Pages middleware: HTTP Basic 認証で全ページをパスワード保護する。
// ID/パスワードは Cloudflare Pages の環境変数 BASIC_AUTH_USER / BASIC_AUTH_PASS から読む。
// ローカルの python http.server では実行されない。
export async function onRequest(context) {
  const { request, env, next } = context;

  // AR起動時、Scene Viewer(Android)や Quick Look(iOS)が別プロセスでモデルを
  // 取得する。これらは Basic 認証を引き継げないため、モデルファイルは認証対象外
  // にする(HTMLページはこれまでどおり保護される)。
  const path = new URL(request.url).pathname.toLowerCase();
  if (path.endsWith(".glb") || path.endsWith(".usdz")) {
    return next();
  }

  const expected =
    "Basic " + btoa(`${env.BASIC_AUTH_USER}:${env.BASIC_AUTH_PASS}`);

  if (request.headers.get("Authorization") !== expected) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="RIMD WebAR Staging"',
      },
    });
  }

  return next();
}
