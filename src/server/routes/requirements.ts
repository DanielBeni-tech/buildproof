import { Router } from 'express';
import {
  createProject,
  listRequirements,
  getRequirement,
  createRequirement,
  updateRequirement,
  archiveRequirement,
} from '../repository/requirements';
import type { NewRequirement } from '../../domain/types';

const router = Router();

router.get('/project', (_req, res) => {
  const project = createProject('BuildProof Demo', 'http://localhost:5173');
  res.json(project);
});

router.get('/requirements', (req, res) => {
  const projectId = req.query.projectId as string;
  if (!projectId) return res.status(400).json({ error: 'projectId required' });
  res.json(listRequirements(projectId));
});

router.get('/requirements/:id', (req, res) => {
  const reqt = getRequirement(req.params.id);
  if (!reqt) return res.status(404).json({ error: 'Not found' });
  res.json(reqt);
});

router.post('/requirements', (req, res) => {
  const projectId = req.body.projectId as string;
  const data: NewRequirement = {
    code: req.body.code,
    statement: req.body.statement,
    priority: req.body.priority,
    note: req.body.note,
  };
  if (!projectId || !data.code || !data.statement || !data.priority) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const created = createRequirement(projectId, data);
  res.status(201).json(created);
});

router.put('/requirements/:id', (req, res) => {
  const updated = updateRequirement(req.params.id, {
    code: req.body.code,
    statement: req.body.statement,
    priority: req.body.priority,
    note: req.body.note,
  });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/requirements/:id', (req, res) => {
  const ok = archiveRequirement(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found or already archived' });
  res.json({ ok: true });
});

export default router;