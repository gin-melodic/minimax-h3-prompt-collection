import type { VideoProvider } from "./types";

export interface VideoMetadata {
  provider: VideoProvider;
  videoId: string | null;
  title: string | null;
  author: string | null;
  coverUrl: string | null;
  status: "success" | "failed";
  error: string | null;
}

export function identifyVideo(input: string): { provider: VideoProvider; videoId: string | null } {
  const url = new URL(input);
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") return { provider: "youtube", videoId: url.pathname.split("/").filter(Boolean)[0] || null };
  if (["youtube.com", "m.youtube.com"].includes(host)) {
    const parts = url.pathname.split("/").filter(Boolean);
    return { provider: "youtube", videoId: url.searchParams.get("v") || (parts[0] === "shorts" || parts[0] === "embed" ? parts[1] : null) || null };
  }
  if (host === "bilibili.com" || host.endsWith(".bilibili.com")) {
    const match = url.pathname.match(/\/(BV[\w]+)/i) || url.search.match(/[?&]bvid=(BV[\w]+)/i);
    return { provider: "bilibili", videoId: match?.[1] || null };
  }
  return { provider: "external", videoId: null };
}

async function fetchJson(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(7000), headers: { "User-Agent": "MinimaxH3Collection/1.0" } });
  if (!response.ok) throw new Error(`Remote metadata returned ${response.status}`);
  return response.json();
}

export async function resolveVideoMetadata(input: string): Promise<VideoMetadata> {
  try {
    let normalized = input;
    const initial = new URL(input);
    if (initial.hostname === "b23.tv") {
      const response = await fetch(input, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(7000) });
      normalized = response.url;
    }
    const identity = identifyVideo(normalized);
    if (identity.provider === "youtube" && identity.videoId) {
      const data = await fetchJson(`https://www.youtube.com/oembed?url=${encodeURIComponent(normalized)}&format=json`) as { title?: string; author_name?: string; thumbnail_url?: string };
      return { ...identity, title: data.title || null, author: data.author_name || null, coverUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${identity.videoId}/hqdefault.jpg`, status: "success", error: null };
    }
    if (identity.provider === "bilibili" && identity.videoId) {
      const data = await fetchJson(`https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(identity.videoId)}`) as { code?: number; message?: string; data?: { title?: string; owner?: { name?: string }; pic?: string } };
      if (data.code !== 0 || !data.data) throw new Error(data.message || "Bilibili metadata unavailable");
      return { ...identity, title: data.data.title || null, author: data.data.owner?.name || null, coverUrl: data.data.pic?.replace(/^http:/, "https:") || null, status: "success", error: null };
    }
    return { ...identity, title: null, author: null, coverUrl: null, status: "failed", error: identity.provider === "external" ? "暂不支持自动读取该平台" : "无法识别视频 ID" };
  } catch (error) {
    let identity: { provider: VideoProvider; videoId: string | null } = { provider: "external", videoId: null };
    try { identity = identifyVideo(input); } catch { /* validated elsewhere */ }
    return { ...identity, title: null, author: null, coverUrl: null, status: "failed", error: error instanceof Error ? error.message : "元数据读取失败" };
  }
}

export function embedUrl(provider: VideoProvider, videoId: string | null) {
  if (!videoId) return null;
  if (provider === "youtube") return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
  if (provider === "bilibili") return `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(videoId)}&page=1&high_quality=1`;
  return null;
}
