
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// --- Retry Logic ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(operation: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> {
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
      const wait = baseDelay * Math.pow(2, 3 - retries) + (Math.random() * 1000);
      console.warn(`[AI SDK] API Error (${status || 'Unknown'}). Retrying in ${Math.round(wait)}ms...`);
      await delay(wait);
      return withRetry(operation, retries - 1, baseDelay);
    }
    throw error;
  }
}

// --- Configuration Helper ---
const createAI = (apiKey: string) => new GoogleGenAI({ apiKey });

// --- 1. Text & Reasoning (Chat, Thinking, Fast) ---
export const generateText = async (
  apiKey: string, 
  prompt: string, 
  history: { role: string; parts: { text: string }[] }[] = [],
  mode: 'fast' | 'standard' | 'thinking' = 'standard',
  systemInstruction?: string,
  specificModel?: string
) => {
  return withRetry(async () => {
      const ai = createAI(apiKey);
      
      let model = 'gemini-3-pro-preview';
      let config: any = {};

      if (specificModel) {
          model = specificModel;
      } else if (mode === 'fast') {
        model = 'gemini-2.5-flash-lite';
      } else if (mode === 'thinking') {
        // If specificModel wasn't provided, use the flagship thinking model
        if (!specificModel) model = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 };
      } else {
        // standard
        model = 'gemini-2.5-flash';
      }

      // Double check: if specific model is 2.5 series and thinking is requested, use budget
      if (mode === 'thinking' && !config.thinkingConfig) {
          config.thinkingConfig = { thinkingBudget: 32768 };
      }

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      const chat = ai.chats.create({ model, config, history });
      const result = await chat.sendMessage({ message: prompt });
      return result.text || "";
  });
};

// --- 2. Grounding (Search & Maps) ---
export const generateGroundedContent = async (
  apiKey: string,
  prompt: string,
  tool: 'search' | 'maps'
) => {
  return withRetry(async () => {
      const ai = createAI(apiKey);
      const model = 'gemini-2.5-flash';
      
      const tools = tool === 'search' ? [{ googleSearch: {} }] : [{ googleMaps: {} }];
      
      const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { tools }
      });

      return {
        text: result.text || "",
        groundingMetadata: result.candidates?.[0]?.groundingMetadata
      };
  });
};

// --- 3. Image Generation ---
export const generateImage = async (
  apiKey: string,
  prompt: string,
  size: '1K' | '2K' | '4K' = '1K'
) => {
  return withRetry(async () => {
      const ai = createAI(apiKey);
      // Switch to gemini-2.5-flash-image (Nano Banana) to avoid permissions issues on Pro
      // Note: imageSize is not supported on this model, so we remove it from config
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1'
          }
        }
      });

      // Extract image
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image generated");
  });
};

// --- 4. Vision (Image Analysis) ---
export const analyzeImage = async (
  apiKey: string,
  base64Image: string,
  prompt: string
) => {
  return withRetry(async () => {
      const ai = createAI(apiKey);
      const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';
      const data = base64Image.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { mimeType, data } },
            { text: prompt }
          ]
        }
      });

      return response.text || "";
  });
};

// --- 5. Speech (TTS) ---
export const generateSpeech = async (
  apiKey: string,
  text: string,
  voiceName: string = 'Kore'
) => {
  return withRetry(async () => {
      const ai = createAI(apiKey);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio generated");
      
      return base64Audio;
  });
};

// --- 6. Transcription ---
export const transcribeAudio = async (
  apiKey: string,
  audioBase64: string,
  mimeType: string = 'audio/wav'
) => {
  return withRetry(async () => {
      const ai = createAI(apiKey);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType, data: audioBase64 } },
                { text: "Transcribe this audio exactly." }
            ]
        }
      });
      return response.text || "";
  });
};

// --- 7. Live API (Real-time) ---
// Returns the session promise to be managed by the hook
export const connectLiveSession = async (
  apiKey: string,
  callbacks: {
    onOpen: () => void;
    onMessage: (msg: LiveServerMessage) => void;
    onError: (err: any) => void;
    onClose: () => void;
  }
) => {
  // Live session connection does not typically use retry logic in the same way 
  // because it establishes a persistent WebSocket connection.
  // We leave it as is, or a simple wrapper can be added if initial connection fails often.
  const ai = createAI(apiKey);
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: callbacks.onOpen,
      onmessage: callbacks.onMessage,
      onerror: callbacks.onError,
      onclose: callbacks.onClose,
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
    },
  });
};
