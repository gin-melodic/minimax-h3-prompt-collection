import Link from "next/link";
import { listAdminWorks } from "@/db/works";
import { archiveWorkAction } from "../actions";

export const dynamic = "force-dynamic";
export default async function AdminWorksPage() {
  const works = await listAdminWorks();
  return <><div className="page-title"><div><p className="eyebrow">COLLECTION</p><h1>作品管理</h1></div><Link className="button" href="/admin/works/new">新建作品</Link></div>
    <div className="admin-list">{works.map((work) => <article key={work.id}><div><span className={`status ${work.status}`}>{work.status}</span><h2>{work.title}</h2><p>{work.videoProvider} · {new Date(work.updatedAt).toLocaleDateString("zh-CN")}</p></div><div className="actions"><Link className="button secondary" href={`/admin/works/${work.id}/edit`}>编辑</Link><form action={archiveWorkAction.bind(null, work.id)}><button className="link-button">归档</button></form></div></article>)}{!works.length && <p className="empty">还没有作品。</p>}</div>
  </>;
}
