import { Router } from 'express';
import {
  createRun,
  getRun,
  listRunsByScenario,
  finalizeRun,
  createResult,
  getResult,
  createEvidence,
  listEvidenceByRun,
  getLastRunByRequirement,
} from '../repository/runs';

const router = Router();

router.post('/runs', (req, res) => {
  const { scenarioId, scenarioVersion, requirementId, targetUrl } = req.body;
  if (!scenarioId || !scenarioVersion || !requirementId || !targetUrl) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const run = createRun({ scenarioId, scenarioVersion, requirementId, targetUrl });
  res.status(201).json(run);
});

router.get('/runs/:id', (req, res) => {
  const run = getRun(req.params.id);
  if (!run) return res.status(404).json({ error: 'Not found' });
  res.json(run);
});

router.get('/runs', (req, res) => {
  const scenarioId = req.query.scenarioId as string;
  if (!scenarioId) return res.status(400).json({ error: 'scenarioId required' });
  res.json(listRunsByScenario(scenarioId));
});

router.post('/runs/:id/finalize', (req, res) => {
  const { state, finishedAt, durationMs } = req.body;
  if (!state || !finishedAt || durationMs === undefined) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const ok = finalizeRun(req.params.id, state, finishedAt, durationMs);
  if (!ok) return res.status(400).json({ error: 'Cannot finalize (not running or already finalized)' });
  res.json({ ok: true });
});

router.post('/runs/:id/result', (req, res) => {
  const { status, summary, diagnosticCode, executedSteps } = req.body;
  const result = createResult({
    runId: req.params.id,
    status,
    summary: summary ?? null,
    diagnosticCode: diagnosticCode ?? null,
    executedSteps: executedSteps ?? [],
  });
  res.status(201).json(result);
});

router.get('/runs/:id/result', (req, res) => {
  const result = getResult(req.params.id);
  if (!result) return res.status(404).json({ error: 'No result' });
  res.json(result);
});

router.post('/runs/:id/evidence', (req, res) => {
  const { kind, uri } = req.body;
  if (!kind) return res.status(400).json({ error: 'kind required' });
  const evidence = createEvidence({
    runId: req.params.id,
    kind,
    uri: uri ?? null,
  });
  res.status(201).json(evidence);
});

router.get('/runs/:id/evidence', (req, res) => {
  res.json(listEvidenceByRun(req.params.id));
});

router.get('/requirements/:requirementId/last-run', (req, res) => {
  const run = getLastRunByRequirement(req.params.requirementId);
  res.json(run ?? null);
});

export default router;