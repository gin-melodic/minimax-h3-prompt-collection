import { listPublishedWorks } from "@/db/works";
import { WorkCard } from "@/components/work-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const works = await listPublishedWorks();
  return <main>
    <section className="hero"><p className="eyebrow">MINIMAX H3 · CURATED PROMPTS</p><h1>提示词不只是文字，<br />而是作品的另一半。</h1><p>收集视频作品、生成思路与可以复用的提示词。</p></section>
    {works.length ? <section className="gallery">{works.map((work) => <WorkCard work={work} key={work.id} />)}</section> : <section className="empty"><h2>作品正在准备中</h2><p>登录管理后台发布第一件作品。</p></section>}
  </main>;
}
