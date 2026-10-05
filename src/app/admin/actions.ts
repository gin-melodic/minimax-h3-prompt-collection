"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminSession, clearAdminSession, isAdmin, verifyAdminSecret } from "@/lib/auth";
import { archiveWork, createWork, updateWork } from "@/db/works";
import { resolveVideoMetadata } from "@/lib/metadata";
import { slugify } from "@/lib/slug";
import { workSchema } from "@/lib/validation";

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function loginAction(_state: { error: string }, formData: FormData) {
  const now = Date.now();
  const key = "single-admin";
  const attempt = attempts.get(key);
  if (attempt && attempt.resetAt > now && attempt.count >= 5) return { error: "尝试次数过多，请稍后再试。" };
  const secret = String(formData.get("secret") || "");
  if (!verifyAdminSecret(secret)) {
    attempts.set(key, attempt && attempt.resetAt > now ? { ...attempt, count: attempt.count + 1 } : { count: 1, resetAt: now + 60_000 });
    return { error: "认证失败。" };
  }
  attempts.delete(key);
  await createAdminSession();
  redirect("/admin/works");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

function stringValue(formData: FormData, key: string) { return String(formData.get(key) || "").trim(); }

async function parseWork(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const videoUrl = stringValue(formData, "videoUrl");
  const metadata = await resolveVideoMetadata(videoUrl);
  const title = stringValue(formData, "title") || metadata.title || "未命名作品";
  const parsed = workSchema.parse({
    title,
    slug: stringValue(formData, "slug") || slugify(title),
    summary: stringValue(formData, "summary"),
    prompt: stringValue(formData, "prompt"),
    notes: stringValue(formData, "notes"),
    category: stringValue(formData, "category"),
    tags: stringValue(formData, "tags"),
    videoUrl,
    videoMode: stringValue(formData, "videoMode") || "auto",
    status: stringValue(formData, "status") || "draft",
    featured: formData.get("featured") === "on",
    remoteAuthor: stringValue(formData, "remoteAuthor") || metadata.author || "",
    remoteCoverUrl: stringValue(formData, "remoteCoverUrl") || metadata.coverUrl || "",
  });
  return {
    slug: parsed.slug, title: parsed.title, summary: parsed.summary || null, prompt: parsed.prompt,
    notes: parsed.notes || null, category: parsed.category || null,
    tags: parsed.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    videoUrl: parsed.videoUrl, videoProvider: metadata.provider, videoId: metadata.videoId,
    videoMode: parsed.videoMode, remoteAuthor: parsed.remoteAuthor || null,
    remoteCoverUrl: parsed.remoteCoverUrl || null, metadataStatus: metadata.status,
    metadataError: metadata.error, featured: parsed.featured, status: parsed.status,
  };
}

export async function createWorkAction(formData: FormData) {
  createWork(await parseWork(formData));
  revalidatePath("/");
  redirect("/admin/works");
}

export async function updateWorkAction(id: number, formData: FormData) {
  updateWork(id, await parseWork(formData));
  revalidatePath("/");
  redirect("/admin/works");
}

export async function archiveWorkAction(id: number) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  archiveWork(id);
  revalidatePath("/");
  revalidatePath("/admin/works");
}
