export type VideoProvider = "youtube" | "bilibili" | "external";
export type VideoMode = "auto" | "embed" | "external";
export type WorkStatus = "draft" | "published" | "archived";

export interface Work {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  prompt: string;
  notes: string | null;
  category: string | null;
  tags: string[];
  videoUrl: string;
  videoProvider: VideoProvider;
  videoId: string | null;
  videoMode: VideoMode;
  remoteAuthor: string | null;
  remoteCoverUrl: string | null;
  metadataStatus: "pending" | "success" | "failed";
  metadataError: string | null;
  featured: boolean;
  status: WorkStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
