import "server-only";
import { pgQuery, sqlite, usesPostgres } from "./client";
import type { Work, WorkStatus } from "@/lib/types";

type WorkRow = Record<string, unknown> & {
  id: number; slug: string; title: string; summary: string | null; prompt: string; notes: string | null;
  category: string | null; tags: string; video_url: string; video_provider: Work["videoProvider"];
  video_id: string | null; video_mode: Work["videoMode"]; remote_author: string | null;
  remote_cover_url: string | null; metadata_status: Work["metadataStatus"]; metadata_error: string | null;
  featured: number | boolean; status: WorkStatus; created_at: string; updated_at: string; published_at: string | null;
};

function mapWork(row: WorkRow): Work {
  let tags: string[] = [];
  try { tags = typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags; } catch { tags = []; }
  return { id:Number(row.id),slug:row.slug,title:row.title,summary:row.summary,prompt:row.prompt,notes:row.notes,
    category:row.category,tags,videoUrl:row.video_url,videoProvider:row.video_provider,videoId:row.video_id,
    videoMode:row.video_mode,remoteAuthor:row.remote_author,remoteCoverUrl:row.remote_cover_url,
    metadataStatus:row.metadata_status,metadataError:row.metadata_error,featured:Boolean(row.featured),status:row.status,
    createdAt:row.created_at,updatedAt:row.updated_at,publishedAt:row.published_at };
}

const columns = `id,slug,title,summary,prompt,notes,category,tags,video_url,video_provider,video_id,video_mode,remote_author,remote_cover_url,metadata_status,metadata_error,featured,status,created_at,updated_at,published_at`;
function sqliteQuery(query: string, params: unknown[]) { return sqlite!.prepare(query.replace(/\$\d+/g, "?")).all(...params) as WorkRow[]; }
async function all(query: string, params: unknown[] = []) { return usesPostgres ? pgQuery<WorkRow>(query, params) : sqliteQuery(query, params); }
async function one(query: string, params: unknown[] = []) { return (await all(query, params))[0]; }

export async function listPublishedWorks() { return (await all(`SELECT ${columns} FROM works WHERE status='published' AND deleted_at IS NULL ORDER BY featured DESC,published_at DESC`)).map(mapWork); }
export async function listAdminWorks() { return (await all(`SELECT ${columns} FROM works WHERE deleted_at IS NULL ORDER BY updated_at DESC`)).map(mapWork); }
export async function getPublishedWork(slug: string) { const row=await one(`SELECT ${columns} FROM works WHERE slug=$1 AND status='published' AND deleted_at IS NULL`,[slug]); return row?mapWork(row):null; }
export async function getAdminWork(id: number) { const row=await one(`SELECT ${columns} FROM works WHERE id=$1 AND deleted_at IS NULL`,[id]); return row?mapWork(row):null; }

export type SaveWorkInput = Omit<Work,"id"|"createdAt"|"updatedAt"|"publishedAt">;

export async function createWork(input: SaveWorkInput) {
  const now=new Date().toISOString();
  const values:unknown[]=[input.slug,input.title,input.summary,input.prompt,input.notes,input.category,JSON.stringify(input.tags),input.videoUrl,input.videoProvider,input.videoId,input.videoMode,input.remoteAuthor,input.remoteCoverUrl,input.metadataStatus,input.metadataError,input.featured,input.status,now,now,input.status==="published"?now:null];
  const names="slug,title,summary,prompt,notes,category,tags,video_url,video_provider,video_id,video_mode,remote_author,remote_cover_url,metadata_status,metadata_error,featured,status,created_at,updated_at,published_at";
  if(usesPostgres){const rows=await pgQuery<{id:number}>(`INSERT INTO works (${names}) VALUES (${values.map((_,i)=>`$${i+1}`).join(",")}) RETURNING id`,values);return Number(rows[0].id);}
  values[15]=input.featured?1:0;
  return Number(sqlite!.prepare(`INSERT INTO works (${names}) VALUES (${values.map(()=>"?").join(",")})`).run(...values).lastInsertRowid);
}

export async function updateWork(id:number,input:SaveWorkInput){
  const now=new Date().toISOString();
  const values:unknown[]=[input.slug,input.title,input.summary,input.prompt,input.notes,input.category,JSON.stringify(input.tags),input.videoUrl,input.videoProvider,input.videoId,input.videoMode,input.remoteAuthor,input.remoteCoverUrl,input.metadataStatus,input.metadataError,input.featured,input.status,now,input.status,now,id];
  const query=`UPDATE works SET slug=$1,title=$2,summary=$3,prompt=$4,notes=$5,category=$6,tags=$7,video_url=$8,video_provider=$9,video_id=$10,video_mode=$11,remote_author=$12,remote_cover_url=$13,metadata_status=$14,metadata_error=$15,featured=$16,status=$17,updated_at=$18,published_at=CASE WHEN $19='published' THEN COALESCE(published_at,$20) ELSE published_at END WHERE id=$21`;
  if(usesPostgres) await pgQuery(query,values); else {values[15]=input.featured?1:0;sqlite!.prepare(query.replace(/\$\d+/g,"?")).run(...values);}
}

export async function archiveWork(id:number){const now=new Date().toISOString();if(usesPostgres)await pgQuery("UPDATE works SET status='archived',updated_at=$1 WHERE id=$2",[now,id]);else sqlite!.prepare("UPDATE works SET status='archived',updated_at=? WHERE id=?").run(now,id);}
