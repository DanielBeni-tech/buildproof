import { Router } from 'express';
import { getScenarioVersion } from '../repository/scenarios';
import { ExecutionCoordinator } from '../execution/coordinator';

const router = Router();

const coordinator = new ExecutionCoordinator();

router.post('/runs/:id/execute', async (req, res) => {
  const runId = req.params.id;
  // Récupérer le run pour avoir le contexte
  const { db } = await import('../repository/index');
  const row: any = db.prepare(`SELECT * FROM runs WHERE id = ?`).get(runId);
  if (!row) return res.status(404).json({ error: 'Run not found' });

  const version = getScenarioVersion(row.scenario_id as string, row.scenario_version as number);
  if (!version) return res.status(404).json({ error: 'Scenario version not found' });

  const context = {
    runId,
    scenarioId: row.scenario_id as string,
    scenarioVersion: row.scenario_version as number,
    requirementId: row.requirement_id as string,
    targetUrl: row.target_url as string,
    steps: version.steps,
  };

  // Lancer l'exécution en arrière-plan (non bloquant)
  coordinator.start(context).catch((err) => {
    console.error(`Execution failed for run ${runId}:`, err);
  });

  res.status(202).json({ runId, status: 'queued' });
});

export default router;