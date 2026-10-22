import { Router } from 'express';
import {
  createScenario,
  getScenario,
  listScenariosByRequirement,
  saveScenarioVersion,
  getScenarioVersion,
  approveScenarioVersion,
  setScenarioDraft,
  deleteScenario,
  deleteScenarioVersion,
} from '../repository/scenarios';
import type { NewScenario } from '../../domain/types';

const router = Router();

router.get('/scenarios', (req, res) => {
  const requirementId = req.query.requirementId as string;
  if (!requirementId) return res.status(400).json({ error: 'requirementId required' });
  res.json(listScenariosByRequirement(requirementId));
});

router.post('/scenarios', (req, res) => {
  const data: NewScenario = {
    requirementId: req.body.requirementId,
    mode: req.body.mode,
    steps: req.body.steps,
  };
  if (!data.requirementId || !data.mode || !Array.isArray(data.steps)) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const created = createScenario(data);
  res.status(201).json(created);
});

router.get('/scenarios/:id', (req, res) => {
  const scenario = getScenario(req.params.id);
  if (!scenario) return res.status(404).json({ error: 'Not found' });
  res.json(scenario);
});

router.post('/scenarios/:id/versions', (req, res) => {
  const scenarioId = req.params.id;
  const steps = req.body.steps;
  const scenario = getScenario(scenarioId);
  if (!scenario) return res.status(404).json({ error: 'Not found' });
  const versionNumber = scenario.currentVersion + 1;
  const saved = saveScenarioVersion(scenarioId, steps, versionNumber);
  res.status(201).json(saved);
});

router.get('/scenarios/:id/versions/:version', (req, res) => {
  const version = getScenarioVersion(req.params.id, parseInt(req.params.version, 10));
  if (!version) return res.status(404).json({ error: 'Version not found' });
  res.json(version);
});

router.post('/scenarios/:id/versions/:version/approve', (req, res) => {
  const scenarioId = req.params.id;
  const versionNumber = parseInt(req.params.version, 10);
  const approvedBy = req.body.approvedBy || 'user';
  const ok = approveScenarioVersion(scenarioId, versionNumber, approvedBy);
  if (!ok) return res.status(400).json({ error: 'Cannot approve' });
  res.json({ ok: true });
});

router.post('/scenarios/:id/draft', (req, res) => {
  const ok = setScenarioDraft(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.delete('/scenarios/:id', (req, res) => {
  const ok = deleteScenario(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.delete('/scenarios/:id/versions/:version', (req, res) => {
  const ok = deleteScenarioVersion(req.params.id, parseInt(req.params.version, 10));
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;