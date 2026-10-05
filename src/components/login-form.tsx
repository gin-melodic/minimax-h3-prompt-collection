"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return <form action={action} className="stack">
    <label>管理密钥<input name="secret" type="password" minLength={32} required autoFocus autoComplete="current-password" /></label>
    {state.error && <p className="error">{state.error}</p>}
    <button className="button" disabled={pending}>{pending ? "验证中…" : "进入后台"}</button>
  </form>;
}
