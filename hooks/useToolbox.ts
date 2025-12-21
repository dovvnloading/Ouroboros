
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSettings } from './useSettings';
import * as AISdk from '../services/aiSdk';
import { LiveServerMessage } from "@google/genai";

// Helper for PCM Decoding (Copied from guidelines)
async function decodeAudioData(
  base64: string,
  ctx: AudioContext
): Promise<AudioBuffer> {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000); // Live API is 24kHz
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

export const useToolbox = () => {
  const { settings } = useSettings();
  const apiKey = settings.keys.google;

  const checkKey = useCallback(() => {
    if (!apiKey) throw new Error("Google API Key not configured in Settings");
    return apiKey;
  }, [apiKey]);

  // --- 1. Chat Hook ---
  const useChat = useCallback((options: { 
    mode?: 'fast' | 'standard' | 'thinking' | 'search' | 'maps', 
    model?: string,
    systemInstruction?: string 
  } = {}) => {
    const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
    const [loading, setLoading] = useState(false);
    const [groundingMetadata, setGroundingMetadata] = useState<any>(null);

    const sendMessage = async (text: string) => {
      setLoading(true);
      const userMsg = { role: 'user', text };
      setMessages(prev => [...prev, userMsg]);

      try {
        const key = checkKey();
        let responseText = "";
        let metadata = null;

        if (options.mode === 'search' || options.mode === 'maps') {
          const res = await AISdk.generateGroundedContent(key, text, options.mode);
          responseText = res.text;
          metadata = res.groundingMetadata;
          setGroundingMetadata(metadata);
        } else {
          // Standard/Fast/Thinking
          // Convert history for SDK
          const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }));
          responseText = await AISdk.generateText(key, text, history, options.mode as any || 'standard', options.systemInstruction, options.model);
        }

        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        return responseText;
      } catch (e: any) {
        console.error(e);
        const errText = `Error: ${e.message}`;
        setMessages(prev => [...prev, { role: 'model', text: errText }]);
        return errText;
      } finally {
        setLoading(false);
      }
    };

    return { messages, sendMessage, loading, groundingMetadata };
  }, [checkKey]);

  // --- 2. Image Gen Hook ---
  const useImageGen = useCallback(() => {
    const [loading, setLoading] = useState(false);
    
    const generate = async (prompt: string, size: '1K'|'2K'|'4K' = '1K') => {
      setLoading(true);
      try {
        const key = checkKey();
        const b64 = await AISdk.generateImage(key, prompt, size);
        setLoading(false);
        return b64;
      } catch (e: any) {
        setLoading(false);
        console.error(e);
        throw e;
      }
    };

    return { generate, loading };
  }, [checkKey]);

  // --- 3. Vision Hook ---
  const useVision = useCallback(() => {
    const [loading, setLoading] = useState(false);
    
    const analyze = async (base64: string, prompt: string) => {
      setLoading(true);
      try {
        const key = checkKey();
        const text = await AISdk.analyzeImage(key, base64, prompt);
        setLoading(false);
        return text;
      } catch (e: any) {
        setLoading(false);
        throw e;
      }
    };
    
    return { analyze, loading };
  }, [checkKey]);

  // --- 4. TTS Hook ---
  const useTTS = useCallback(() => {
    const [loading, setLoading] = useState(false);

    const speak = async (text: string, voice = 'Kore') => {
      setLoading(true);
      try {
        const key = checkKey();
        const base64 = await AISdk.generateSpeech(key, text, voice);
        
        // Play audio
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(base64, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        // Cleanup after playback to avoid leaks
        source.onended = () => {
            if (ctx.state !== 'closed') {
                ctx.close().catch(console.error);
            }
        };

        source.start();
        
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.error(e);
      }
    };

    return { speak, loading };
  }, [checkKey]);

  // --- 5. Transcription Hook ---
  const useTranscribe = useCallback(() => {
    const [loading, setLoading] = useState(false);

    const transcribe = async (audioBlob: Blob) => {
      setLoading(true);
      try {
        const key = checkKey();
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                try {
                    const text = await AISdk.transcribeAudio(key, base64, audioBlob.type);
                    setLoading(false);
                    resolve(text);
                } catch(err) {
                    setLoading(false);
                    reject(err);
                }
            };
            reader.readAsDataURL(audioBlob);
        });
      } catch (e) {
        setLoading(false);
        throw e;
      }
    };
    return { transcribe, loading };
  }, [checkKey]);

  // --- 6. Live API Hook ---
  const useLiveAPI = useCallback(() => {
    const [connected, setConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const sessionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const processorNodeRef = useRef<ScriptProcessorNode | null>(null);

    const disconnect = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.then((s: any) => s.close());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
        if (processorNodeRef.current) processorNodeRef.current.disconnect();
        
        setConnected(false);
        setIsSpeaking(false);
    }, []);

    const connect = useCallback(async () => {
        try {
            setError(null);
            const key = checkKey();
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = ctx;

            // Input handling
            const stream = await navigator.mediaDevices.getUserMedia({ audio: {
                sampleRate: 16000,
                channelCount: 1
            }});
            
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            inputAudioContextRef.current = inputCtx;
            sourceNodeRef.current = inputCtx.createMediaStreamSource(stream);
            processorNodeRef.current = inputCtx.createScriptProcessor(4096, 1, 1);
            
            // Helper for 16-bit PCM conversion
            const pcmConvert = (data: Float32Array) => {
                const l = data.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
                const uint8 = new Uint8Array(int16.buffer);
                let binary = '';
                const len = uint8.byteLength;
                for (let i = 0; i < len; i++) binary += String.fromCharCode(uint8[i]);
                return btoa(binary);
            };

            const callbacks = {
                onOpen: () => {
                    setConnected(true);
                    // Start pumping audio
                    if (processorNodeRef.current && sourceNodeRef.current) {
                        processorNodeRef.current.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const b64 = pcmConvert(inputData);
                            if (sessionRef.current) {
                                sessionRef.current.then((session: any) => {
                                    session.sendRealtimeInput({
                                        media: {
                                            mimeType: 'audio/pcm;rate=16000',
                                            data: b64
                                        }
                                    });
                                });
                            }
                        };
                        sourceNodeRef.current.connect(processorNodeRef.current);
                        processorNodeRef.current.connect(inputCtx.destination);
                    }
                },
                onMessage: async (msg: LiveServerMessage) => {
                    const data = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (data && audioContextRef.current) {
                        setIsSpeaking(true);
                        const buffer = await decodeAudioData(data, audioContextRef.current);
                        
                        const src = audioContextRef.current.createBufferSource();
                        src.buffer = buffer;
                        src.connect(audioContextRef.current.destination);
                        
                        const now = audioContextRef.current.currentTime;
                        const start = Math.max(now, nextStartTimeRef.current);
                        src.start(start);
                        nextStartTimeRef.current = start + buffer.duration;
                        
                        src.onended = () => {
                             if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
                                 setIsSpeaking(false);
                             }
                        };
                    }
                },
                onError: (e: any) => {
                    console.error("Live API Error", e);
                    setError(e.message || "Connection Error");
                    disconnect();
                },
                onClose: () => {
                    setConnected(false);
                    setIsSpeaking(false);
                }
            };

            sessionRef.current = AISdk.connectLiveSession(key, callbacks);

        } catch (e: any) {
            setError(e.message);
        }
    }, [checkKey, disconnect]);

    return { connect, disconnect, connected, isSpeaking, error };
  }, [checkKey]);

  return useMemo(() => ({
    useChat,
    useImageGen,
    useVision,
    useTTS,
    useTranscribe,
    useLiveAPI
  }), [useChat, useImageGen, useVision, useTTS, useTranscribe, useLiveAPI]);
};
