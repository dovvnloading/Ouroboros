
import { AppSettings } from "../components/SettingsModal";
import { callLLM } from "./llm";
import { ORCHESTRATOR_SYSTEM } from "./prompts";

export interface WidgetSummary {
  id: string;
  prompt: string;
}

export interface AgentAction {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  id?: string;
  prompt?: string;
}

export interface AgentPlan {
  thought: string;
  actions: AgentAction[];
}

/**
 * Stage 1: The Orchestrator
 * Decides WHAT to build, update, or delete.
 */
export const planAgentActions = async (userPrompt: string, currentWidgets: WidgetSummary[], settings: AppSettings): Promise<AgentPlan> => {
  try {
    const context = currentWidgets.length > 0 
      ? `Current Dashboard State:\n${currentWidgets.map(w => `- [${w.id}] ${w.prompt}`).join('\n')}`
      : "Current Dashboard State: Empty Canvas";
    
    const lang = settings.language === 'es' ? 'Spanish' : 'English';

    const fullPrompt = `User Request: "${userPrompt}"\nUser Language: ${lang}\n${context}\n\nFormulate a plan. If creating new widgets, describe their function in ${lang}.`;
    
    const text = await callLLM(settings, fullPrompt, ORCHESTRATOR_SYSTEM, true);
    return JSON.parse(text) as AgentPlan;
  } catch (error) {
    console.error("Planning Error:", error);
    return {
      thought: "Fallback due to planning error.",
      actions: [{ type: 'CREATE', prompt: userPrompt }]
    };
  }
};
