import { db, nowISO, generateId } from './index';
import type { Scenario, ScenarioVersion, NewScenario, ActionStep } from '../../domain/types';

export function createScenario(data: NewScenario): Scenario {
  const id = generateId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO scenarios (id, requirement_id, mode, state, current_version, created_at, updated_at)
     VALUES (?, ?, ?, 'draft', 0, ?, ?)`
  ).run(id, data.requirementId, data.mode, now, now);
  return getScenario(id)!;
}

export function getScenario(id: string): Scenario | null {
  const row = db.prepare(`SELECT * FROM scenarios WHERE id = ?`).get(id);
  return row ? (row as Scenario) : null;
}

export function listScenariosByRequirement(requirementId: string): Scenario[] {
  return db
    .prepare(`SELECT * FROM scenarios WHERE requirement_id = ? ORDER BY created_at DESC`)
    .all(requirementId) as Scenario[];
}

export function saveScenarioVersion(
  scenarioId: string,
  steps: ActionStep[],
  versionNumber: number
): ScenarioVersion {
  const id = generateId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO scenario_versions (id, scenario_id, version_number, steps, approved_at, approved_by, created_at)
     VALUES (?, ?, ?, ?, NULL, NULL, ?)`
  ).run(id, scenarioId, versionNumber, JSON.stringify(steps), now);
  return {
    id,
    scenarioId,
    versionNumber,
    steps,
    approvedAt: null,
    approvedBy: null,
    createdAt: now,
  };
}

export function getScenarioVersion(scenarioId: string, versionNumber: number): ScenarioVersion | null {
  const row: any = db.prepare(
    `SELECT * FROM scenario_versions WHERE scenario_id = ? AND version_number = ?`
  ).get(scenarioId, versionNumber);
  if (!row) return null;
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    versionNumber: row.version_number,
    steps: JSON.parse(row.steps),
    approvedAt: row.approved_at,
    approvedBy: row.approved_by,
    createdAt: row.created_at,
  };
}

export function approveScenarioVersion(
  scenarioId: string,
  versionNumber: number,
  approvedBy: string
): boolean {
  const now = nowISO();
  const result = db.prepare(
    `UPDATE scenario_versions SET approved_at = ?, approved_by = ? WHERE scenario_id = ? AND version_number = ?`
  ).run(now, approvedBy, scenarioId, versionNumber);
  if (result.changes > 0) {
    db.prepare(
      `UPDATE scenarios SET state = 'approved', current_version = ?, updated_at = ? WHERE id = ?`
    ).run(versionNumber, now, scenarioId);
  }
  return result.changes > 0;
}

export function setScenarioDraft(scenarioId: string): boolean {
  const now = nowISO();
  const result = db.prepare(
    `UPDATE scenarios SET state = 'draft', updated_at = ? WHERE id = ?`
  ).run(now, scenarioId);
  return result.changes > 0;
}

export function deleteScenario(id: string): boolean {
  const result = db.prepare(`DELETE FROM scenarios WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function deleteScenarioVersion(scenarioId: string, versionNumber: number): boolean {
  const result = db.prepare(
    `DELETE FROM scenario_versions WHERE scenario_id = ? AND version_number = ?`
  ).run(scenarioId, versionNumber);
  return result.changes > 0;
}