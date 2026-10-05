import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const databasePath = process.env.DATABASE_PATH
  ? path.resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH)
  : path.join(process.cwd(), "data", "app.db");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const globalForDb = globalThis as unknown as { db?: Database.Database };
export const db = globalForDb.db ?? new Database(databasePath);
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    prompt TEXT NOT NULL,
    notes TEXT,
    category TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    video_url TEXT NOT NULL,
    video_provider TEXT NOT NULL CHECK(video_provider IN ('youtube','bilibili','external')),
    video_id TEXT,
    video_mode TEXT NOT NULL DEFAULT 'auto' CHECK(video_mode IN ('auto','embed','external')),
    remote_author TEXT,
    remote_cover_url TEXT,
    metadata_status TEXT NOT NULL DEFAULT 'pending' CHECK(metadata_status IN ('pending','success','failed')),
    metadata_error TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published_at TEXT,
    deleted_at TEXT
  );
  CREATE INDEX IF NOT EXISTS works_status_updated_idx ON works(status, updated_at DESC);
  CREATE INDEX IF NOT EXISTS works_category_idx ON works(category);
`);
