import { z } from "zod";

export const workSchema = z.object({
  title: z.string().trim().min(1, "请输入标题").max(160),
  slug: z.string().trim().min(1).max(180),
  summary: z.string().trim().max(500).optional().default(""),
  prompt: z.string().trim().min(1, "请输入提示词").max(30000),
  notes: z.string().trim().max(10000).optional().default(""),
  category: z.string().trim().max(80).optional().default(""),
  tags: z.string().trim().max(500).optional().default(""),
  videoUrl: z.string().url("请输入有效的视频 URL").refine((url) => url.startsWith("https://"), "只允许 HTTPS URL"),
  videoMode: z.enum(["auto", "embed", "external"]),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean().default(false),
  remoteAuthor: z.string().trim().max(160).optional().default(""),
  remoteCoverUrl: z.union([z.literal(""), z.string().url().refine((url) => url.startsWith("https://"))]).default(""),
});
