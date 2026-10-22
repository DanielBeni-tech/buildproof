import { chromium } from 'playwright';
import type { ExecutionContext } from './coordinator';

interface RunResult {
  state: 'succeeded' | 'failed' | 'blocked' | 'timeout';
  status: 'pass' | 'fail';
  summary: string;
  diagnosticCode: string;
  executedSteps: Array<{
    stepId: string;
    action: string;
    selector?: string;
    value?: string;
    success: boolean;
    error?: string;
    durationMs: number;
  }>;
}

interface EvidenceItem {
  kind: string;
  state: 'available' | 'unavailable';
  uri: string | null;
}

// Origine autorisée : l'URL cible du projet. Toute autre navigation est bloquée.
function isAuthorizedTarget(url: string, targetUrl: string): boolean {
  try {
    const target = new URL(targetUrl);
    const candidate = new URL(url);
    // Le hostname doit correspondre exactement, et le protocole doit être http ou https
    return candidate.hostname === target.hostname
      && (candidate.protocol === 'http:' || candidate.protocol === 'https:')
      && !isPrivateOrMetadata(candidate.hostname);
  } catch {
    return false;
  }
}

function isPrivateOrMetadata(hostname: string): boolean {
  const privatePatterns = [
    'localhost',
    '127.',
    '10.',
    '172.16.',
    '172.17.',
    '172.18.',
    '172.19.',
    '172.20.',
    '172.21.',
    '172.22.',
    '172.23.',
    '172.24.',
    '172.25.',
    '172.26.',
    '172.27.',
    '172.28.',
    '172.29.',
    '172.30.',
    '172.31.',
    '192.168.',
    '169.254.', // link-local
    'metadata.google.internal',
    'metadata.azure.com',
    '169.254.169.254',
  ];
  return privatePatterns.some((p) => hostname.startsWith(p) || hostname === p);
}

export class BrowserAdapter {
  async run(context: ExecutionContext): Promise<{ runResult: RunResult; evidence: EvidenceItem[] }> {
    const browser = await chromium.launch({ headless: true });
    const contextPage = await browser.newPage();
    const evidence: EvidenceItem[] = [];
    const executedSteps: RunResult['executedSteps'] = [];
    let state: RunResult['state'] = 'succeeded';
    let status: RunResult['status'] = 'pass';
    let summary = '';

    try {
      // Navigation initiale vers l'URL cible uniquement
      if (!isAuthorizedTarget(context.targetUrl, context.targetUrl)) {
        throw new Error(`Target URL not authorized: ${context.targetUrl}`);
      }

      await contextPage.goto(context.targetUrl, { timeout: 10000 });
      evidence.push({
        kind: 'screenshot',
        state: 'available',
        uri: `data/runs/${context.runId}/screenshot-initial.png`,
      });

      for (const step of context.steps.sort((a, b) => a.order - b.order)) {
        const start = Date.now();
        let success = false;
        let error: string | undefined;

        try {
          // Valider que toute navigation reste dans l'origin cible
          if (step.action === 'navigate' && step.url && !isAuthorizedTarget(step.url, context.targetUrl)) {
            throw new Error(`Navigation to unauthorized URL: ${step.url}`);
          }

          switch (step.action) {
            case 'navigate':
              await contextPage.goto(step.url!, { timeout: 10000 });
              success = true;
              break;
            case 'fill':
              await contextPage.fill(step.selector!, step.value!);
              success = true;
              break;
            case 'click':
              await contextPage.click(step.selector!);
              success = true;
              break;
            case 'assertVisible': {
              const visible = await contextPage.isVisible(step.selector!);
              success = visible;
              if (!visible) error = `Element not visible: ${step.selector}`;
              break;
            }
            case 'assertText': {
              const text = await contextPage.textContent(step.selector!);
              success = text?.includes(step.value!);
              if (!success) error = `Text mismatch in ${step.selector}`;
              break;
            }
            case 'assertUrl': {
              const currentUrl = contextPage.url();
              success = currentUrl === step.url;
              if (!success) error = `URL mismatch: expected ${step.url}, got ${currentUrl}`;
              break;
            }
          }
        } catch (err) {
          success = false;
          error = err instanceof Error ? err.message : String(err);
          state = 'failed';
          status = 'fail';
        }

        executedSteps.push({
          stepId: step.id,
          action: step.action,
          selector: step.selector,
          value: step.value,
          success,
          error,
          durationMs: Date.now() - start,
        });

        if (!success) {
          // S'arrêter sur première étape échouée pour garder la trace lisible
          break;
        }
      }

      // Capture finale
      try {
        const screenshot = await contextPage.screenshot({ fullPage: true });
        const fs = await import('fs');
        const path = await import('path');
        const dir = path.join(process.cwd(), 'data', 'runs', context.runId);
        fs.mkdirSync(dir, { recursive: true });
        const uri = path.join(dir, 'screenshot-final.png');
        fs.writeFileSync(uri, screenshot);
        evidence.push({
          kind: 'screenshot',
          state: 'available',
          uri,
        });
      } catch {
        evidence.push({ kind: 'screenshot', state: 'unavailable', uri: null });
      }

      summary = state === 'succeeded' ? 'All steps passed.' : `Execution ${state}.`;
    } catch (err) {
      state = 'blocked';
      status = 'fail';
      summary = err instanceof Error ? err.message : String(err);
    } finally {
      await contextPage.close();
      await browser.close();
    }

    return {
      runResult: { state, status, summary, diagnosticCode: state === 'succeeded' ? 'unknown' : 'selector', executedSteps },
      evidence,
    };
  }
}