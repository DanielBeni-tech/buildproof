import { z } from 'zod';

export const ActionStepSchema = z.object({
  id: z.string(),
  action: z.enum([
    'navigate',
    'fill',
    'click',
    'assertVisible',
    'assertText',
    'assertUrl',
  ]),
  selector: z.string().optional(),
  value: z.string().optional(),
  url: z.string().url().optional(),
  order: z.number().int().nonnegative(),
});

export const ScenarioVersionSchema = z.object({
  id: z.string(),
  scenarioId: z.string(),
  versionNumber: z.number().int().nonnegative(),
  steps: z.array(ActionStepSchema),
  approvedAt: z.string().nullable(),
  approvedBy: z.string().nullable(),
  createdAt: z.string(),
});

export const NewRequirementSchema = z.object({
  code: z.string().min(1),
  statement: z.string().min(1),
  priority: z.string().min(1),
  note: z.string().optional(),
});

export const NewScenarioSchema = z.object({
  requirementId: z.string(),
  mode: z.enum(['browser', 'guided']),
  steps: z.array(ActionStepSchema),
});

export const NewRunSchema = z.object({
  scenarioId: z.string(),
  scenarioVersion: z.number().int().nonnegative(),
  requirementId: z.string(),
  targetUrl: z.string().url(),
});

export type ActionStep = z.infer<typeof ActionStepSchema>;
export type NewRequirement = z.infer<typeof NewRequirementSchema>;
export type NewScenario = z.infer<typeof NewScenarioSchema>;
export type NewRun = z.infer<typeof NewRunSchema>;