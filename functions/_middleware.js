// Cloudflare Pages middleware: HTTP Basic 認証で全ページをパスワード保護する。
// ID/パスワードは Cloudflare Pages の環境変数 BASIC_AUTH_USER / BASIC_AUTH_PASS から読む
// （リポジトリにパスワードを書かない）。ローカルの python http.server では実行されない。
export async function onRequest(context) {
  const { request, env, next } = context;

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
