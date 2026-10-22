import { db, nowISO, generateId } from './index';
import type { NewRequirement, Requirement } from '../../domain/types';

export function createProject(title: string, targetUrl: string) {
  const id = generateId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO projects (id, title, target_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, title, targetUrl, now, now);
  return { id, title, targetUrl, createdAt: now, updatedAt: now };
}

export function listRequirements(projectId: string): Requirement[] {
  return db
    .prepare(
      `SELECT * FROM requirements WHERE project_id = ? AND archived_at IS NULL
       ORDER BY created_at DESC`
    )
    .all(projectId) as Requirement[];
}

export function getRequirement(id: string): Requirement | null {
  const row = db.prepare(`SELECT * FROM requirements WHERE id = ?`).get(id);
  return row ? (row as Requirement) : null;
}

export function createRequirement(
  projectId: string,
  data: NewRequirement
): Requirement {
  const id = generateId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO requirements (id, project_id, code, statement, priority, note, archived_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`
  ).run(id, projectId, data.code, data.statement, data.priority, data.note ?? '', now, now);
  return getRequirement(id)!;
}

export function updateRequirement(id: string, data: Partial<NewRequirement>): Requirement | null {
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code); }
  if (data.statement !== undefined) { fields.push('statement = ?'); values.push(data.statement); }
  if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority); }
  if (data.note !== undefined) { fields.push('note = ?'); values.push(data.note); }
  if (fields.length === 0) return getRequirement(id);
  fields.push('updated_at = ?');
  values.push(nowISO(), id);
  db.prepare(`UPDATE requirements SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getRequirement(id);
}

export function archiveRequirement(id: string): boolean {
  const now = nowISO();
  const result = db.prepare(
    `UPDATE requirements SET archived_at = ?, updated_at = ? WHERE id = ? AND archived_at IS NULL`
  ).run(now, now, id);
  return result.changes > 0;
}