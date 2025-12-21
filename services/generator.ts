

import { AppSettings } from "../components/SettingsModal";
import { AccessibilitySettings } from "../hooks/useAccessibility";
import { getTemplates, TemplateId } from "../utils/templates";
import { callLLM } from "./llm";
import { ARCHITECT_SYSTEM, ENGINEER_SYSTEM } from "./prompts";

export type StatusCallback = (status: string) => void;
export type LogCallback = (message: string, data?: any) => void;

/**
 * Stage 2 & 3: The Architect and The Engineer
 * Uses chain-of-thought prompting to design then build.
 * NOW FEATURING: Just-In-Time Template Injection.
 */
export const generateWidgetCode = async (
    prompt: string, 
    settings: AppSettings, 
    theme: 'light' | 'dark',
    onStatus?: StatusCallback,
    a11ySettings?: AccessibilitySettings,
    onLog?: LogCallback
): Promise<string> => {
  try {
    const lang = settings.language === 'es' ? 'Spanish (Español)' : 'English';
    const langCode = settings.language || 'en';

    // 1. Architect Phase
    if (onStatus) onStatus("Architect: Designing technical specification...");
    if (onLog) onLog("Designing technical specification...", prompt);

    const architectPrompt = `
      User Request: "${prompt}"
      User Language: ${lang}
      Current System Theme: ${theme.toUpperCase()}

      Analyze this request and produce a technical Blueprint for the React Engineer. 
      REMEMBER: The user is currently in ${theme.toUpperCase()} mode. 
      While you must support both modes via Tailwind 'dark:' classes, 
      ensure the visual hierarchy (colors, contrast, shadows) is specifically intuitive for the active ${theme} environment.
      
      IMPORTANT: All user-facing text in the Blueprint/UI MUST be in ${lang}.

      Classify the app type and append RECOMMENDED_TEMPLATE at the end.
    `;
    const blueprint = await callLLM(settings, architectPrompt, ARCHITECT_SYSTEM, false);
    
    if (onLog) onLog("Blueprint created.", blueprint);

    // Extract Recommended Template
    const templateMatch = blueprint.match(/RECOMMENDED_TEMPLATE:\s*(\w+)/);
    const templateId = (templateMatch ? templateMatch[1].toLowerCase() : 'blank') as TemplateId;
    
    // FETCH TRANSLATED TEMPLATES
    const TEMPLATES = getTemplates(langCode);
    const templateCode = TEMPLATES[templateId] || TEMPLATES['tool']; // Fallback to tool if blank
    
    if (onStatus) onStatus(`Engineer: Adapting ${templateId.toUpperCase()} template...`);
    if (onLog) onLog(`Selected Template: ${templateId.toUpperCase()}`);

    // 2. Engineer Phase (With JIT Template Injection)
    let extraRequirements = "";
    if (a11ySettings?.screenReader) {
        extraRequirements = `
        *** STRICT ACCESSIBILITY REQUIREMENTS (WCAG 2.1 AA) ***
        The user requires Screen Reader optimization.
        1. Semantic HTML: Use <main>, <nav>, <article>, <header>, <footer>, <section>.
        2. Buttons: ALL icon-only buttons MUST have 'aria-label'. Ex: <button aria-label="Close settings"><X /></button>.
        3. Headings: Maintain proper hierarchy (h2, h3).
        4. Focus Management: If you create a modal or dropdown, manage focus.
        5. Images: All images/charts must have alt text or descriptive aria-labels.
        `;
    }

    const engineerPrompt = `
      Here is the Architect's Blueprint:
      ${blueprint}

      The user's active theme is ${theme.toUpperCase()}.
      The user's language is ${lang}. YOU MUST TRANSLATE ALL UI TEXT TO ${lang}.
      
      ${extraRequirements}

      *** JIT TEMPLATE INJECTION ***
      To speed up development and ensure quality, utilize the following code as your STARTING SKELETON.
      Keep the structure, imports, and layout style, but modify the content/logic to match the Architect's spec.
      
      STARTING SKELETON:
      \`\`\`tsx
      ${templateCode}
      \`\`\`

      Now, write the final, fully functional React component based on the Blueprint and the Skeleton.
    `;
    let code = await callLLM(settings, engineerPrompt, ENGINEER_SYSTEM, false);
    
    // Cleanup code fences
    code = code.replace(/^```tsx\n/, "").replace(/^```\n/, "").replace(/```$/, "");
    
    return code;
  } catch (error) {
    console.error("Code Gen Error:", error);
    throw new Error("Failed to generate widget code.");
  }
};
