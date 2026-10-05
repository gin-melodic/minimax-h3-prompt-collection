import { embedUrl } from "@/lib/metadata";
import type { Work } from "@/lib/types";

/* Remote video thumbnails intentionally bypass Next Image: provider hosts are dynamic and no local proxy is used. */

export function VideoPlayer({ work }: { work: Work }) {
  const embed = work.videoMode === "external" ? null : embedUrl(work.videoProvider, work.videoId);
  if (embed) return <div className="video-wrap"><iframe src={embed} title={work.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="no-referrer" /></div>;
  return <a className="cover-link" href={work.videoUrl} target="_blank" rel="noreferrer">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {work.remoteCoverUrl ? <img src={work.remoteCoverUrl} alt={work.title} referrerPolicy="no-referrer" /> : <span className="cover-placeholder">打开原视频</span>}
  </a>;
}
