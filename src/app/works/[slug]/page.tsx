import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedWork } from "@/db/works";
import { VideoPlayer } from "@/components/video-player";
import { CopyPrompt } from "@/components/copy-prompt";

export const dynamic = "force-dynamic";

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const work = getPublishedWork((await params).slug);
  if (!work) notFound();
  return <main className="work-page">
    <Link href="/" className="back">← 返回作品集</Link>
    <VideoPlayer work={work} />
    <section className="work-head"><div><p className="eyebrow">{work.category || work.videoProvider}</p><h1>{work.title}</h1><p>{work.remoteAuthor}</p></div><a className="button secondary" href={work.videoUrl} target="_blank" rel="noreferrer">在原平台观看 ↗</a></section>
    {work.summary && <p className="lead">{work.summary}</p>}
    <section className="prompt-panel"><div className="panel-title"><h2>Prompt</h2><CopyPrompt prompt={work.prompt} /></div><pre>{work.prompt}</pre></section>
    {work.notes && <section className="notes"><h2>创作说明</h2><p>{work.notes}</p></section>}
  </main>;
}
