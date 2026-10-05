import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin/works");
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">PRIVATE ACCESS</p><h1>管理后台</h1><p>请输入管理员密钥。</p><LoginForm /></section></main>;
}
