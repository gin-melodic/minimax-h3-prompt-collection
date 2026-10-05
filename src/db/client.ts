import "server-only";
import Database from "better-sqlite3";
import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";

const postgresUrl = [
  process.env.POSTGRES_URL,
  process.env.DATABASE_URL,
  process.env.DATABASE_URL_UNPOOLED,
  process.env.POSTGRES_URL_NON_POOLING,
  process.env.NEON_DATABASE_URL,
].find((value) => value?.startsWith("postgres://") || value?.startsWith("postgresql://"));
export const usesPostgres = Boolean(postgresUrl);

const tableSql = `CREATE TABLE IF NOT EXISTS works (
  id SERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, summary TEXT,
  prompt TEXT NOT NULL, notes TEXT, category TEXT, tags TEXT NOT NULL DEFAULT '[]',
  video_url TEXT NOT NULL, video_provider TEXT NOT NULL CHECK(video_provider IN ('youtube','bilibili','external')),
  video_id TEXT, video_mode TEXT NOT NULL DEFAULT 'auto' CHECK(video_mode IN ('auto','embed','external')),
  remote_author TEXT, remote_cover_url TEXT,
  metadata_status TEXT NOT NULL DEFAULT 'pending' CHECK(metadata_status IN ('pending','success','failed')),
  metadata_error TEXT, featured BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, published_at TEXT, deleted_at TEXT
)`;

const pg = postgresUrl ? neon(postgresUrl) : null;
let postgresReady: Promise<void> | null = null;

export async function pgQuery<T extends Record<string, unknown>>(query: string, params: unknown[] = []) {
  if (!pg) throw new Error("Postgres is not configured");
  if (!postgresReady) postgresReady = (async () => {
    await pg.query(tableSql, []);
    await pg.query("CREATE INDEX IF NOT EXISTS works_status_updated_idx ON works(status, updated_at DESC)", []);
    await pg.query("CREATE INDEX IF NOT EXISTS works_category_idx ON works(category)", []);
  })();
  await postgresReady;
  return pg.query(query, params) as Promise<T[]>;
}

const globalForDb = globalThis as unknown as { sqlite?: Database.Database };
function createSqlite() {
  if (process.env.VERCEL) {
    throw new Error(
      "Postgres is not configured. Connect a Neon/Postgres database to this Vercel project and expose DATABASE_URL or POSTGRES_URL to Production.",
    );
  }
  const databasePath = process.env.DATABASE_PATH
    ? path.resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH)
    : path.join(process.cwd(), "data", "app.db");
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.exec(tableSql.replace("id SERIAL PRIMARY KEY", "id INTEGER PRIMARY KEY AUTOINCREMENT").replace("featured BOOLEAN NOT NULL DEFAULT FALSE", "featured INTEGER NOT NULL DEFAULT 0"));
  database.exec("CREATE INDEX IF NOT EXISTS works_status_updated_idx ON works(status, updated_at DESC)");
  database.exec("CREATE INDEX IF NOT EXISTS works_category_idx ON works(category)");
  return database;
}

export const sqlite = usesPostgres ? null : (globalForDb.sqlite ?? createSqlite());
if (process.env.NODE_ENV !== "production" && sqlite) globalForDb.sqlite = sqlite;
