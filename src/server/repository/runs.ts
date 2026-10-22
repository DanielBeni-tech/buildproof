import { db, nowISO, generateId } from './index';
import type { Run, Result, Evidence, ExecutedStep } from '../../domain/types';

export function createRun(data: {
  scenarioId: string;
  scenarioVersion: number;
  requirementId: string;
  targetUrl: string;
}): Run {
  const id = generateId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO runs (id, scenario_id, scenario_version, requirement_id, state, target_url)
     VALUES (?, ?, ?, ?, 'queued', ?)`
  ).run(id, data.scenarioId, data.scenarioVersion, data.requirementId, data.targetUrl);
  return getRun(id)!;
}

export function getRun(id: string): Run | null {
  const row = db.prepare(`SELECT * FROM runs WHERE id = ?`).get(id);
  return row ? (row as Run) : null;
}

export function listRunsByScenario(scenarioId: string): Run[] {
  return db
    .prepare(`SELECT * FROM runs WHERE scenario_id = ? ORDER BY started_at DESC`)
    .all(scenarioId) as Run[];
}

export function updateRunState(id: string, state: string): Run | null {
  db.prepare(`UPDATE runs SET state = ? WHERE id = ?`).run(state, id);
  return getRun(id);
}

export function finalizeRun(
  id: string,
  state: 'succeeded' | 'failed' | 'blocked' | 'timeout',
  finishedAt: string,
  durationMs: number
): boolean {
  const result = db.prepare(
    `UPDATE runs SET state = ?, finished_at = ?, duration_ms = ? WHERE id = ? AND state = 'running'`
  ).run(state, finishedAt, durationMs, id);
  return result.changes > 0;
}

export function createResult(data: {
  runId: string;
  status: string;
  summary: string | null;
  diagnosticCode: string | null;
  executedSteps: ExecutedStep[];
}): Result {
  const id = generateId();
  db.prepare(
    `INSERT INTO results (id, run_id, status, summary, diagnostic_code, executed_steps)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.runId,
    data.status,
    data.summary,
    data.diagnosticCode,
    JSON.stringify(data.executedSteps)
  );
  return getResult(id)!;
}

export function getResult(runId: string): Result | null {
  const row = db.prepare(`SELECT * FROM results WHERE run_id = ?`).get(runId);
  if (!row) return null;
  return {
    id: row.id as string,
    runId: row.run_id as string,
    status: row.status as string,
    summary: row.summary as string | null,
    diagnosticCode: row.diagnostic_code as string | null,
    executedSteps: JSON.parse(row.executed_steps as string),
  };
}

export function createEvidence(data: {
  runId: string;
  kind: string;
  state?: 'available' | 'unavailable';
  uri: string | null;
}): Evidence {
  const id = generateId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO evidence (id, run_id, kind, state, created_at, uri)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, data.runId, data.kind, data.state ?? 'available', now, data.uri);
  return getEvidence(id)!;
}

export function getEvidence(id: string): Evidence | null {
  const row = db.prepare(`SELECT * FROM evidence WHERE id = ?`).get(id);
  return row ? (row as Evidence) : null;
}

export function listEvidenceByRun(runId: string): Evidence[] {
  return db
    .prepare(`SELECT * FROM evidence WHERE run_id = ? ORDER BY created_at ASC`)
    .all(runId) as Evidence[];
}

export function getLastRunByRequirement(requirementId: string): Run | null {
  const row = db.prepare(
    `SELECT * FROM runs WHERE requirement_id = ? ORDER BY started_at DESC LIMIT 1`
  ).get(requirementId);
  return row ? (row as Run) : null;
}