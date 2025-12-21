
import { GoogleGenAI } from "@google/genai";
import { AppSettings } from "../components/SettingsModal";

// --- Retry Logic ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(operation: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const msg = error?.message || '';
    const status = error?.status || error?.code;
    
    // Identify Retryable Errors: 429 (Quota), 503 (Overload), 500 (Internal)
    const isRateLimit = status === 429 || status === 'RESOURCE_EXHAUSTED' || msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
    const isServerFactor = status === 503 || status === 500;

    if (retries > 0 && (isRateLimit || isServerFactor)) {
      // Exponential Backoff with Jitter
      const wait = baseDelay * Math.pow(2, 3 - retries) + (Math.random() * 500);
      console.warn(`[LLM Service] API Error (${status || 'Unknown'}). Retrying in ${Math.round(wait)}ms...`);
      await delay(wait);
      return withRetry(operation, retries - 1, baseDelay);
    }
    throw error;
  }
}

// Helper to get the correct key and model
const getCredentials = (settings: AppSettings) => {
    return {
        key: settings.keys[settings.provider],
        model: settings.models[settings.provider]
    };
};

// --- Google Provider ---
const callGoogle = async (apiKey: string, model: string, prompt: string, system: string, jsonMode: boolean = false) => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: system,
        responseMimeType: jsonMode ? "application/json" : "text/plain",
      },
    });
    return response.text || "";
};

// --- OpenAI Provider ---
const callOpenAI = async (apiKey: string, model: string, prompt: string, system: string, jsonMode: boolean = false) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt }
            ],
            response_format: jsonMode ? { type: "json_object" } : undefined,
            temperature: 0.7
        })
    });
    
    if (!response.ok) {
        // Try to parse error body for better debugging
        let errorBody;
        try { errorBody = await response.json(); } catch {}
        
        throw {
            status: response.status,
            message: errorBody?.error?.message || response.statusText
        };
    }
    const data = await response.json();
    return data.choices[0].message.content;
};

// --- Anthropic Provider ---
const callAnthropic = async (apiKey: string, model: string, prompt: string, system: string, jsonMode: boolean = false) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
            model: model,
            max_tokens: 4096,
            system: system,
            messages: [
                { role: "user", content: prompt }
            ]
        })
    });

    if (!response.ok) {
        let errorBody;
        try { errorBody = await response.json(); } catch {}
        
        throw {
            status: response.status,
            message: errorBody?.error?.message || response.statusText
        };
    }
    const data = await response.json();
    return data.content[0].text;
};

// --- Main Router ---
export const callLLM = async (settings: AppSettings, prompt: string, system: string, jsonMode: boolean = false): Promise<string> => {
    const { key, model } = getCredentials(settings);
    if (!key) throw new Error(`Missing API Key for ${settings.provider}`);
    if (!model) throw new Error(`Missing Model selection for ${settings.provider}`);

    return withRetry(async () => {
        switch (settings.provider) {
            case 'google':
                return callGoogle(key, model, prompt, system, jsonMode);
            case 'openai':
                return callOpenAI(key, model, prompt, system, jsonMode);
            case 'anthropic':
                return callAnthropic(key, model, prompt, system, jsonMode);
            default:
                throw new Error("Unknown provider");
        }
    });
};
