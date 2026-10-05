import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: { default: "H3 Prompt Gallery", template: "%s · H3 Prompt Gallery" }, description: "Minimax H3 提示词作品集" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><header className="site-header"><Link href="/" className="brand">H3 / PROMPTS</Link><nav><Link href="/">作品</Link><Link href="/admin">管理</Link></nav></header>{children}<footer>Minimax H3 Prompt Collection</footer></body></html>;
}
