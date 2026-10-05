import "server-only";
import { db } from "./client";
import type { Work, WorkStatus } from "@/lib/types";

type WorkRow = {
  id: number; slug: string; title: string; summary: string | null; prompt: string; notes: string | null;
  category: string | null; tags: string; video_url: string; video_provider: Work["videoProvider"];
  video_id: string | null; video_mode: Work["videoMode"]; remote_author: string | null;
  remote_cover_url: string | null; metadata_status: Work["metadataStatus"]; metadata_error: string | null;
  featured: number; status: WorkStatus; created_at: string; updated_at: string; published_at: string | null;
};

function mapWork(row: WorkRow): Work {
  let tags: string[] = [];
  try { tags = JSON.parse(row.tags); } catch { tags = []; }
  return {
    id: row.id, slug: row.slug, title: row.title, summary: row.summary, prompt: row.prompt,
    notes: row.notes, category: row.category, tags, videoUrl: row.video_url,
    videoProvider: row.video_provider, videoId: row.video_id, videoMode: row.video_mode,
    remoteAuthor: row.remote_author, remoteCoverUrl: row.remote_cover_url,
    metadataStatus: row.metadata_status, metadataError: row.metadata_error,
    featured: Boolean(row.featured), status: row.status, createdAt: row.created_at,
    updatedAt: row.updated_at, publishedAt: row.published_at,
  };
}

const selectColumns = `id, slug, title, summary, prompt, notes, category, tags, video_url,
  video_provider, video_id, video_mode, remote_author, remote_cover_url, metadata_status,
  metadata_error, featured, status, created_at, updated_at, published_at`;

export function listPublishedWorks() {
  return (db.prepare(`SELECT ${selectColumns} FROM works WHERE status = 'published' AND deleted_at IS NULL ORDER BY featured DESC, published_at DESC`).all() as WorkRow[]).map(mapWork);
}

export function listAdminWorks() {
  return (db.prepare(`SELECT ${selectColumns} FROM works WHERE deleted_at IS NULL ORDER BY updated_at DESC`).all() as WorkRow[]).map(mapWork);
}

export function getPublishedWork(slug: string) {
  const row = db.prepare(`SELECT ${selectColumns} FROM works WHERE slug = ? AND status = 'published' AND deleted_at IS NULL`).get(slug) as WorkRow | undefined;
  return row ? mapWork(row) : null;
}

export function getAdminWork(id: number) {
  const row = db.prepare(`SELECT ${selectColumns} FROM works WHERE id = ? AND deleted_at IS NULL`).get(id) as WorkRow | undefined;
  return row ? mapWork(row) : null;
}

export type SaveWorkInput = Omit<Work, "id" | "createdAt" | "updatedAt" | "publishedAt">;

export function createWork(input: SaveWorkInput) {
  const now = new Date().toISOString();
  const publishedAt = input.status === "published" ? now : null;
  const result = db.prepare(`INSERT INTO works (
    slug,title,summary,prompt,notes,category,tags,video_url,video_provider,video_id,video_mode,
    remote_author,remote_cover_url,metadata_status,metadata_error,featured,status,created_at,updated_at,published_at
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    input.slug, input.title, input.summary, input.prompt, input.notes, input.category,
    JSON.stringify(input.tags), input.videoUrl, input.videoProvider, input.videoId, input.videoMode,
    input.remoteAuthor, input.remoteCoverUrl, input.metadataStatus, input.metadataError,
    input.featured ? 1 : 0, input.status, now, now, publishedAt,
  );
  return Number(result.lastInsertRowid);
}

export function updateWork(id: number, input: SaveWorkInput) {
  const now = new Date().toISOString();
  db.prepare(`UPDATE works SET slug=?,title=?,summary=?,prompt=?,notes=?,category=?,tags=?,video_url=?,
    video_provider=?,video_id=?,video_mode=?,remote_author=?,remote_cover_url=?,metadata_status=?,
    metadata_error=?,featured=?,status=?,updated_at=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,?) ELSE published_at END WHERE id=?`).run(
    input.slug,input.title,input.summary,input.prompt,input.notes,input.category,JSON.stringify(input.tags),
    input.videoUrl,input.videoProvider,input.videoId,input.videoMode,input.remoteAuthor,input.remoteCoverUrl,
    input.metadataStatus,input.metadataError,input.featured ? 1 : 0,input.status,now,input.status,now,id,
  );
}

export function archiveWork(id: number) {
  db.prepare("UPDATE works SET status='archived', updated_at=? WHERE id=?").run(new Date().toISOString(), id);
}
