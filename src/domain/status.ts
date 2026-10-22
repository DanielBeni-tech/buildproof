export const RUN_STATE = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  BLOCKED: 'blocked',
  TIMEOUT: 'timeout',
} as const;

export type RunState = (typeof RUN_STATE)[keyof typeof RUN_STATE];

export const VERIFICATION_STATUS = {
  PASS: 'pass',
  FAIL: 'fail',
  BLOCKED: 'blocked',
  NOT_TESTED: 'not tested',
  NEEDS_REVIEW: 'needs review',
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

export const DIAGNOSTIC_CODE = {
  SELECTOR: 'selector',
  NAVIGATION: 'navigation',
  TIMEOUT: 'timeout',
  CRASH: 'crash',
  UNKNOWN: 'unknown',
} as const;

export type DiagnosticCode = (typeof DIAGNOSTIC_CODE)[keyof typeof DIAGNOSTIC_CODE];

export const SCENARIO_STATE = {
  DRAFT: 'draft',
  APPROVED: 'approved',
} as const;

export type ScenarioState = (typeof SCENARIO_STATE)[keyof typeof SCENARIO_STATE];

export const SCENARIO_MODE = {
  BROWSER: 'browser',
  GUIDED: 'guided',
} as const;

export type ScenarioMode = (typeof SCENARIO_MODE)[keyof typeof SCENARIO_MODE];

export const EVIDENCE_KIND = {
  SCREENSHOT: 'screenshot',
  STEP_LOG: 'step-log',
  MANUAL_NOTE: 'manual-note',
  DIAGNOSTIC: 'diagnostic',
} as const;

export type EvidenceKind = (typeof EVIDENCE_KIND)[keyof typeof EVIDENCE_KIND];

export const EVIDENCE_STATE = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
} as const;

export type EvidenceState = (typeof EVIDENCE_STATE)[keyof typeof EVIDENCE_STATE];