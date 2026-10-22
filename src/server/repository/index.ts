import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'buildproof.sqlite');

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      target_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      code TEXT NOT NULL,
      statement TEXT NOT NULL,
      priority TEXT NOT NULL,
      note TEXT DEFAULT '',
      archived_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      requirement_id TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'browser',
      state TEXT NOT NULL DEFAULT 'draft',
      current_version INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (requirement_id) REFERENCES requirements(id)
    );

    CREATE TABLE IF NOT EXISTS scenario_versions (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      steps TEXT NOT NULL,
      approved_at TEXT,
      approved_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (scenario_id) REFERENCES scenarios(id),
      UNIQUE(scenario_id, version_number)
    );

    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      scenario_version INTEGER NOT NULL,
      requirement_id TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'queued',
      started_at TEXT,
      finished_at TEXT,
      duration_ms INTEGER,
      target_url TEXT NOT NULL,
      FOREIGN KEY (scenario_id) REFERENCES scenarios(id),
      FOREIGN KEY (requirement_id) REFERENCES requirements(id)
    );

    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      summary TEXT,
      diagnostic_code TEXT,
      executed_steps TEXT NOT NULL,
      FOREIGN KEY (run_id) REFERENCES runs(id)
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'available',
      created_at TEXT NOT NULL,
      uri TEXT,
      FOREIGN KEY (run_id) REFERENCES runs(id)
    );
  `);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function generateId(): string {
  return crypto.randomUUID();
}