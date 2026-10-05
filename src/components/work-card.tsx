import Link from "next/link";
import type { Work } from "@/lib/types";

export function WorkCard({ work }: { work: Work }) {
  return <article className="card">
    <Link href={`/works/${work.slug}`} className="card-cover">
      {/* eslint-disable-next-line @next/next/no-img-element -- dynamic provider thumbnails stay remote by design */}
      {work.remoteCoverUrl ? <img src={work.remoteCoverUrl} alt="" referrerPolicy="no-referrer" loading="lazy" /> : <span className="cover-placeholder">{work.videoProvider}</span>}
    </Link>
    <div className="card-body">
      <div className="eyebrow">{work.category || work.videoProvider}</div>
      <h2><Link href={`/works/${work.slug}`}>{work.title}</Link></h2>
      {work.summary && <p>{work.summary}</p>}
      <div className="tag-row">{work.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div>
    </div>
  </article>;
}
