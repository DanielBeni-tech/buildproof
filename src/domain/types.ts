import type {
  RunState,
  ScenarioState,
  ScenarioMode,
  VerificationStatus,
  DiagnosticCode,
  EvidenceKind,
  EvidenceState,
} from './status';

export interface Project {
  id: string;
  title: string;
  targetUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Requirement {
  id: string;
  projectId: string;
  code: string;
  statement: string;
  priority: string;
  note: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Scenario {
  id: string;
  requirementId: string;
  mode: ScenarioMode;
  state: ScenarioState;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioVersion {
  id: string;
  scenarioId: string;
  versionNumber: number;
  steps: ActionStep[];
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
}

export interface ActionStep {
  id: string;
  action: 'navigate' | 'fill' | 'click' | 'assertVisible' | 'assertText' | 'assertUrl';
  selector?: string;
  value?: string;
  url?: string;
  order: number;
}

export interface Run {
  id: string;
  scenarioId: string;
  scenarioVersion: number;
  requirementId: string;
  state: RunState;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  targetUrl: string;
}

export interface Result {
  id: string;
  runId: string;
  status: VerificationStatus;
  summary: string | null;
  diagnosticCode: DiagnosticCode | null;
  executedSteps: ExecutedStep[];
}

export interface ExecutedStep {
  stepId: string;
  action: ActionStep['action'];
  selector?: string;
  value?: string;
  success: boolean;
  error?: string;
  durationMs: number;
}

export interface Evidence {
  id: string;
  runId: string;
  kind: EvidenceKind;
  state: EvidenceState;
  createdAt: string;
  uri: string | null;
}

export interface NewRequirement {
  code: string;
  statement: string;
  priority: string;
  note: string;
}

export interface NewScenario {
  requirementId: string;
  mode: ScenarioMode;
  steps: ActionStep[];
}

export interface NewRun {
  scenarioId: string;
  scenarioVersion: number;
  requirementId: string;
  targetUrl: string;
}