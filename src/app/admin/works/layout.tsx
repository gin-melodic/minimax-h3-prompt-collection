import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";

export const metadata = { robots: { index: false, follow: false } };
export default async function AdminWorksLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return <main className="admin-shell"><aside><Link href="/admin/works" className="brand">H3 / ADMIN</Link><Link href="/admin/works">全部作品</Link><Link href="/admin/works/new">新建作品</Link><form action={logoutAction}><button className="link-button">退出登录</button></form></aside><section className="admin-content">{children}</section></main>;
}
