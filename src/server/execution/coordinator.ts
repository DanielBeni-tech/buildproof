import { nowISO } from '../repository/index';
import { createRun, updateRunState, finalizeRun, createResult, createEvidence } from '../repository/runs';

export interface ExecutionContext {
  runId: string;
  scenarioId: string;
  scenarioVersion: number;
  requirementId: string;
  targetUrl: string;
  steps: Array<{ id: string; action: string; selector?: string; value?: string; url?: string; order: number }>;
}

export class ExecutionCoordinator {
  async start(context: ExecutionContext): Promise<void> {
    const run = createRun({
      scenarioId: context.scenarioId,
      scenarioVersion: context.scenarioVersion,
      requirementId: context.requirementId,
      targetUrl: context.targetUrl,
    });

    updateRunState(run.id, 'running');

    try {
      const { runResult, evidence } = await this.executeSteps(context);

      const finishedAt = nowISO();
      const startedAt = run.startedAt || finishedAt;
      const durationMs = Date.parse(finishedAt) - Date.parse(startedAt);

      const finalized = finalizeRun(run.id, runResult.state as 'blocked' | 'failed' | 'succeeded' | 'timeout', finishedAt, durationMs);
      if (!finalized) {
        throw new Error('Run could not be finalized (already finalized or not running)');
      }

      createResult({
        runId: run.id,
        status: runResult.status,
        summary: runResult.summary,
        diagnosticCode: (runResult.diagnosticCode as 'selector' | 'navigation' | 'timeout' | 'crash' | 'unknown') ?? 'unknown',
        executedSteps: runResult.executedSteps as any,
      });

      for (const ev of evidence) {
        createEvidence({
          runId: run.id,
          kind: ev.kind,
          state: ev.state,
          uri: ev.uri,
        });
      }
    } catch (error) {
      const finishedAt = nowISO();
      const startedAt = run.startedAt || finishedAt;
      const durationMs = Date.parse(finishedAt) - Date.parse(startedAt);
      finalizeRun(run.id, 'failed', finishedAt, durationMs);

      createResult({
        runId: run.id,
        status: 'fail',
        summary: error instanceof Error ? error.message : String(error),
        diagnosticCode: 'unknown',
        executedSteps: [],
      });

      createEvidence({
        runId: run.id,
        kind: 'diagnostic',
        state: 'available',
        uri: null,
      });
    }
  }

  private async executeSteps(context: ExecutionContext) {
    const { BrowserAdapter } = await import('./browser');
    const adapter = new BrowserAdapter();
    return adapter.run(context);
  }
}