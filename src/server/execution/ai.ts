export interface AIScenarioRequest {
  requirementId: string;
  statement: string;
  priority: string;
}

export interface AIScenarioResponse {
  steps: Array<{
    action: 'navigate' | 'fill' | 'click' | 'assertVisible' | 'assertText' | 'assertUrl';
    selector?: string;
    value?: string;
    url?: string;
    order: number;
  }>;
}

export class AIService {
  async generateScenario(_request: AIScenarioRequest): Promise<AIScenarioResponse> {
    // Le fournisseur d'IA est une décision ouverte, non encore choisie.
    // Aucun appel IA n'est effectué depuis le frontend. L'IA reste derrière
    // cette interface serveur. Aucun crédit Cline gratuit n'est présumé.
    // OmniRoute n'est pas requis.
    throw new Error(
      'AI scenario generation is not configured. ' +
      'Please set an AI provider implementation in src/server/execution/ai.ts. ' +
      'Steps can be entered manually in the meantime.'
    );
  }
}

export const aiService = new AIService();