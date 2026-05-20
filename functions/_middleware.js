// ⚠️ 一時デバッグ版。Basic認証が弾かれる原因を切り分けるための診断を401本文に表示する。
// パスワードの値は出さず、設定有無・文字数・一致判定のみ表示する。
// 原因が判明したら下部コメントの「本番版」に戻すこと（顧客共有前に必須）。
export async function onRequest(context) {
  const { request, env, next } = context;
  const auth = request.headers.get("Authorization") || "";

  const envUser = env.BASIC_AUTH_USER;
  const envPass = env.BASIC_AUTH_PASS;

  let recvUser = null;
  let recvPass = null;
  let decodeError = null;
  if (auth.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const i = decoded.indexOf(":");
      recvUser = decoded.slice(0, i);
      recvPass = decoded.slice(i + 1);
    } catch (e) {
      decodeError = String(e);
    }
  }

  const userMatch = recvUser !== null && recvUser === envUser;
  const passMatch = recvPass !== null && recvPass === envPass;

  if (userMatch && passMatch) {
    return next();
  }

  const diag = [
    "=== Basic Auth 診断 ===",
    `env.BASIC_AUTH_USER: ${
      envUser === undefined ? "未設定(undefined) → 環境変数未反映。再デプロイが必要" : `設定あり 文字数${envUser.length}`
    }`,
    `env.BASIC_AUTH_PASS: ${
      envPass === undefined ? "未設定(undefined) → 環境変数未反映。再デプロイが必要" : `設定あり 文字数${envPass.length}`
    }`,
    `Authorizationヘッダ: ${auth ? "受信あり" : "受信なし"}`,
    decodeError ? `デコードエラー: ${decodeError}` : null,
    `受信ユーザー名: ${recvUser === null ? "(なし)" : `"${recvUser}" 文字数${recvUser.length}`}`,
    `受信パスワード文字数: ${recvPass === null ? "(なし)" : recvPass.length}`,
    `ユーザー名一致: ${userMatch}`,
    `パスワード一致: ${passMatch}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return new Response(diag, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="RIMD WebAR Staging (DEBUG)"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

// --- 本番版（診断が済んだらこれに戻す）---
// export async function onRequest(context) {
//   const { request, env, next } = context;
//   const expected =
//     "Basic " + btoa(`${env.BASIC_AUTH_USER}:${env.BASIC_AUTH_PASS}`);
//   if (request.headers.get("Authorization") !== expected) {
//     return new Response("Authentication required", {
//       status: 401,
//       headers: { "WWW-Authenticate": 'Basic realm="RIMD WebAR Staging"' },
//     });
//   }
//   return next();
// }
