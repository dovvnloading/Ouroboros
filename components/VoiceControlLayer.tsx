
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Activity, AlertCircle, Command } from 'lucide-react';
import { translations } from '../utils/i18n';
import { AppSettings } from './SettingsModal';

interface VoiceControlLayerProps {
  enabled: boolean;
  onAgentRequest: (prompt: string) => void;
  onEmergency?: () => void;
  settings: AppSettings;
}

interface InteractableToken {
  id: number;
  el: HTMLElement;
  rect: DOMRect;
  tag: string;
}

export const VoiceControlLayer: React.FC<VoiceControlLayerProps> = ({ enabled, onAgentRequest, onEmergency, settings }) => {
  const [tokens, setTokens] = useState<InteractableToken[]>([]);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const scanIntervalRef = useRef<any>(null);

  const t = translations[settings.language || 'en'].voiceHud;

  // --- DOM Scanner ---
  const scanInteractables = useCallback(() => {
    if (!enabled) return;
    
    // Select candidates
    const selectors = [
      'button', 'a', 'input', 'textarea', 'select', 
      '[role="button"]', '[role="checkbox"]', '[role="switch"]', 
      '[tabindex="0"]', '.clickable'
    ];
    const nodes = document.querySelectorAll(selectors.join(','));
    const newTokenList: InteractableToken[] = [];
    
    let counter = 1;
    
    nodes.forEach((node) => {
      const el = node as HTMLElement;
      // Visibility Check
      if (el.offsetParent === null) return; // Hidden
      const rect = el.getBoundingClientRect();
      
      // Screen Bounds Check
      if (
        rect.width > 0 && rect.height > 0 &&
        rect.top >= 0 && rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      ) {
         // Check if already covered (naive collision check for nested elements)
         // We skip this for now to ensure all nested controls are accessible
         newTokenList.push({
           id: counter++,
           el,
           rect,
           tag: el.tagName.toLowerCase()
         });
      }
    });

    // Simple diff to avoid constant re-renders if count matches (optimization)
    // In a real SOTA app, we'd do a deep comparison or use keys.
    setTokens(prev => {
        if (prev.length === newTokenList.length) return prev; // Rough check
        return newTokenList;
    });

  }, [enabled]);

  // --- Voice Engine ---
  useEffect(() => {
    if (!enabled) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setTokens([]);
      return;
    }

    // Init Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Browser does not support Voice API.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings.language === 'es' ? 'es-ES' : 'en-US';

    recognition.onstart = () => {
        setListening(true);
        setError(null);
    };
    
    recognition.onend = () => {
        setListening(false);
        // Auto-restart if still enabled
        if (enabled && !error) {
            try { recognition.start(); } catch {}
        }
    };

    recognition.onerror = (event: any) => {
        console.error("Voice Error", event.error);
        if (event.error === 'not-allowed') {
            setError("Microphone access denied.");
        }
    };

    recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const text = result[0].transcript.trim().toLowerCase();
        setTranscript(text);

        if (result.isFinal) {
            handleCommand(text);
        }
    };

    try {
        recognition.start();
    } catch (e) { console.error(e); }

    recognitionRef.current = recognition;

    // Start Scanner Loop
    scanInteractables(); // Initial
    scanIntervalRef.current = setInterval(scanInteractables, 1000); // Polling for DOM changes

    return () => {
       if (recognitionRef.current) recognitionRef.current.stop();
       if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [enabled, scanInteractables, settings.language]);


  // --- Command Processor ---
  const handleCommand = (cmd: string) => {
    // 0. Emergency Trigger (English & Spanish keywords)
    if (
        /^(emergency|panic|emergencia|pánico) mode/.test(cmd) || 
        cmd.includes("help me") || cmd.includes("ayuda") || 
        cmd.includes("i need space") || cmd.includes("necesito espacio")
    ) {
        setLastAction(t.emergency);
        if (onEmergency) onEmergency();
        return;
    }

    // 1. Click / Select / Tap [Number]
    const clickMatch = cmd.match(/^(?:click|select|tap|press|focus|clic|seleccionar|pulsar)\s+(\d+)$/);
    if (clickMatch) {
       const id = parseInt(clickMatch[1]);
       const target = tokens.find(t => t.id === id);
       if (target) {
          setLastAction(`${t.click} #${id}`);
          target.el.focus();
          target.el.click();
          return;
       }
    }

    // 2. Type [Text] in/into [Number]
    const typeMatch = cmd.match(/^(?:type|input|write|escribir|ingresar)\s+(.+)\s+(?:in|into|at|en)\s+(\d+)$/);
    if (typeMatch) {
        const text = typeMatch[1];
        const id = parseInt(typeMatch[2]);
        const target = tokens.find(t => t.id === id);
        if (target && (target.tag === 'input' || target.tag === 'textarea')) {
            setLastAction(`Typed "${text}" in #${id}`);
            target.el.focus();
            (target.el as HTMLInputElement).value = text;
            // Trigger React change event simulation
            const event = new Event('input', { bubbles: true });
            target.el.dispatchEvent(event);
            return;
        }
    }

    // 3. Scroll
    if (cmd.includes('scroll down') || cmd.includes('bajar')) {
        window.scrollBy({ top: 400, behavior: 'smooth' });
        setLastAction(t.scrollDown);
        return;
    }
    if (cmd.includes('scroll up') || cmd.includes('subir')) {
        window.scrollBy({ top: -400, behavior: 'smooth' });
        setLastAction("Scroll Up");
        return;
    }
    if (cmd.includes('top of page') || cmd.includes('inicio')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // 4. Agent Routing
    // If it starts with "agent", "computer", "build", "create", "make"
    if (/^(agent|computer|build|create|make|design|agente|computadora|construir|crear|hacer|diseñar)\b/.test(cmd)) {
        const prompt = cmd.replace(/^(agent|computer|agente|computadora)\s+/, '');
        setLastAction(`Agent: "${prompt}"`);
        onAgentRequest(prompt);
        return;
    }

    // Fallback info
    setLastAction(`Unrecognized: "${cmd}"`);
  };


  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden font-sans">
        
        {/* Token Overlays */}
        {tokens.map((token) => (
            <div
              key={token.id}
              className="absolute flex items-center justify-center rounded-sm shadow-sm animate-in fade-in duration-200"
              style={{
                  top: token.rect.top,
                  left: token.rect.left,
                  minWidth: '20px',
                  height: '20px',
                  backgroundColor: '#F59E0B', // Amber-500 for high visibility
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '0 4px',
                  zIndex: 999999,
                  transform: 'translate(-30%, -30%)', // Offset slightly to corner
                  border: '1px solid white'
              }}
            >
                {token.id}
            </div>
        ))}

        {/* HUD / Status Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className={`
                flex items-center gap-4 px-6 py-3 rounded-full backdrop-blur-xl border shadow-2xl transition-all duration-300
                ${listening ? 'bg-zinc-900/90 border-zinc-700 text-white' : 'bg-red-900/90 border-red-700 text-red-100'}
            `}>
                <div className={`p-2 rounded-full ${listening ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {listening ? <Mic size={20} className="animate-pulse" /> : <MicOff size={20} />}
                </div>
                
                <div className="flex flex-col min-w-[200px] max-w-[400px]">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">
                            {error ? t.error : t.active}
                        </span>
                        {listening && <Activity size={12} className="text-emerald-400 animate-pulse" />}
                    </div>
                    
                    {error ? (
                        <span className="text-sm font-medium text-red-300 flex items-center gap-2 mt-1">
                            <AlertCircle size={14} /> {error}
                        </span>
                    ) : (
                        <div className="mt-1">
                            <p className="text-sm font-medium truncate">
                                {transcript || t.listening}
                            </p>
                            {lastAction && (
                                <p className="text-[10px] text-emerald-300 mt-0.5 animate-in fade-in slide-in-from-bottom-1">
                                    {t.last}: {lastAction}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-white/10 mx-2" />

                <div className="flex flex-col gap-1 text-[10px] text-white/40 font-mono">
                    <div className="flex items-center gap-1"><Command size={10} /> <span>"Click [N]"</span></div>
                    <div className="flex items-center gap-1"><Command size={10} /> <span>"Scroll Down"</span></div>
                    <div className="flex items-center gap-1"><Command size={10} /> <span>"Emergency Mode"</span></div>
                </div>
            </div>
        </div>

    </div>
  );
};
