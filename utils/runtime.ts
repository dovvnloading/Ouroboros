
import React from 'react';
import * as LucideReact from 'lucide-react';
import * as Recharts from 'recharts';
import * as DndKitCore from '@dnd-kit/core';
import * as DndKitSortable from '@dnd-kit/sortable';
import * as DndKitUtilities from '@dnd-kit/utilities';
import { translations } from './i18n';

// Access to global babel provided by the script tag in index.html
declare const Babel: any;

export interface CompilationResult {
  component: React.ComponentType | null;
  error: string | null;
}

// --- Dnd Kit Polyfills for AI Hallucinations ---
// Sometimes the AI assumes CSS.Transform.translate3d exists because of old tutorials.
// We patch it here to prevent runtime crashes.
const SafeDndKitUtilities = {
  ...DndKitUtilities,
  CSS: {
    ...(DndKitUtilities.CSS || {}),
    Transform: {
      ...(DndKitUtilities.CSS?.Transform || {}),
      toString: DndKitUtilities.CSS?.Transform?.toString,
      // Polyfill for common hallucination
      translate3d: (transform: any) => DndKitUtilities.CSS?.Transform?.toString(transform),
    },
    Translate: {
        ...(DndKitUtilities.CSS?.Translate || {}),
        toString: DndKitUtilities.CSS?.Translate?.toString,
        // Polyfill just in case
        translate3d: (transform: any) => DndKitUtilities.CSS?.Translate?.toString(transform),
    }
  }
};

/**
 * Transpiles and evaluates a string of React/TSX code into a usable Component.
 * @param code The TSX code string.
 * @param scope An object containing external modules to be required by the dynamic code.
 */
export const compileComponent = (code: string, scope: Record<string, any> = {}): CompilationResult => {
  try {
    // 1. Transpile TSX to CommonJS using Babel Standalone
    const transpiled = Babel.transform(code, {
      presets: ['env', 'react', 'typescript'],
      filename: 'dynamic.tsx',
    }).code;

    // 2. Create a factory function to execute the CommonJS code
    // We wrap it to provide 'exports', 'require', 'React', etc.
    const exports: { default?: React.ComponentType } = {};
    
    // Custom require function that checks the injected scope first
    const customRequire = (moduleName: string) => {
      if (scope[moduleName]) return scope[moduleName];
      if (moduleName === 'react') return React;
      if (moduleName === 'lucide-react') return LucideReact;
      if (moduleName === 'recharts') return Recharts;
      
      // Dnd Kit Support
      if (moduleName === '@dnd-kit/core') return DndKitCore;
      if (moduleName === '@dnd-kit/sortable') return DndKitSortable;
      // Use the patched utilities
      if (moduleName === '@dnd-kit/utilities') return SafeDndKitUtilities;
      
      // Ouroboros API via Scope
      if (moduleName === 'ouroboros') {
          if (scope['ouroboros']) return scope['ouroboros'];
      }

      // Explicit error for common mistakes
      if (moduleName === 'framer-motion') {
         throw new Error("Module 'framer-motion' is not available. Use CSS animations or Tailwind classes.");
      }

      throw new Error(`Module '${moduleName}' is not available in the Ouroboros runtime. Available: react, lucide-react, recharts, @dnd-kit/*, ouroboros.`);
    };

    // Construct the function body. 
    // We start with "use strict" to ensure safer execution.
    const functionBody = `
      "use strict";
      ${transpiled}
      return exports;
    `;

    // 3. Create the Function
    const func = new Function('exports', 'require', 'React', functionBody);

    // 4. Execute the function
    func(exports, customRequire, React);

    // 5. Extract the default export
    if (!exports.default) {
      return { component: null, error: "The generated code did not default export a React component." };
    }

    return { component: exports.default, error: null };

  } catch (err: any) {
    console.error("Compilation Error:", err);
    return { component: null, error: err.message || "Unknown compilation error" };
  }
};

// Generates the System Status Manual code with localized text
export const getDefaultCode = (lang: 'en' | 'es') => {
  const t = translations[lang].manual;
  return `
import React from 'react';
import * as Lucide from 'lucide-react';

export default function OuroborosBriefing() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 font-sans">
      
      {/* Header - Simplified to avoid clipping artifacts */}
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-4 shrink-0">
         <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
             <Lucide.BookOpen size={20} />
         </div>
         <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100">${t.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
               <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Prototype - Google Ai Labs v0.2.5</span>
            </div>
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 custom-scrollbar">
        
        {/* Section 1 */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-zinc-400 dark:text-zinc-600">
             <Lucide.Terminal size={14} />
             <h2 className="text-[10px] font-bold uppercase tracking-widest">${t.missionTitle}</h2>
          </div>
          <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            <p className="mb-3">
              ${t.missionText1} <strong className="text-zinc-900 dark:text-zinc-100">Ouroboros</strong>, a recursive interface engine.
            </p>
            <p>
              ${t.missionText2}
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section>
           <div className="flex items-center gap-2 mb-3 text-zinc-400 dark:text-zinc-600">
             <Lucide.Command size={14} />
             <h2 className="text-[10px] font-bold uppercase tracking-widest">${t.controlsTitle}</h2>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {[
              { label: 'AI Command Bar', key: 'CMD+K' },
              { label: 'Pan Canvas', key: 'Space+Drag' },
              { label: 'Zoom View', key: 'Ctrl+Scroll' },
              { label: 'Context Menu', key: 'Right Click' }
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{row.label}</span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-100 dark:border-zinc-800">
                  {row.key}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 */}
        <section>
           <div className="flex items-center gap-2 mb-3 text-zinc-400 dark:text-zinc-600">
             <Lucide.Zap size={14} />
             <h2 className="text-[10px] font-bold uppercase tracking-widest">${t.capabilitiesTitle}</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
             {['React Gen', 'Gemini', 'Live Audio', 'Vision API'].map((item, i) => (
               <div key={i} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 text-center">
                  {item}
               </div>
             ))}
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 flex justify-between items-center shrink-0">
         <span className="font-mono">ID: OURO_GEN_003</span>
         <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            ${t.secure}
         </span>
      </div>
    </div>
  );
}`;
};

// Generates the Muse/IdeaBoard code with localized text and system prompts
export const getIdeaBoardCode = (lang: 'en' | 'es') => {
  const t = translations[lang].muse;
  
  // NOTE: Logic for using language is also embedded dynamically via `preferences` inside the widget,
  // but we keep these hardcoded fallbacks for initial static text.
  
  const tagsStr = JSON.stringify(t.tags);

  return `
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowRight, Zap, Eraser, 
  Loader2, Wand2, RefreshCw, AlertCircle
} from 'lucide-react';
import { useChat, useAgent, preferences } from 'ouroboros';

// Determine language for System Prompt dynamically if possible, or fallback
const activeLang = preferences?.language || 'en';
const systemLangInstructions = activeLang === 'es' 
  ? "Output ALL content in Spanish (Español). Translate any concepts to Spanish." 
  : "Output in English.";

const MUSE_SYSTEM = \`You are The Muse, an AI specifically designed to suggest React micro-apps for the "Ouroboros" sandbox.
Output STRICT JSON.
\${systemLangInstructions}

**THE SANDBOX CONSTRAINTS (CRITICAL):**
1. **Frontend Only**: No backend, no database. State must be local (useState/useReducer) or use the AI hooks.
2. **Allowed Libs**: ONLY React, Tailwind CSS, Lucide Icons, Recharts, @dnd-kit/core.
   - NO external npm packages (e.g., framer-motion, three.js).
3. **Data**: External APIs often fail due to CORS. **Prefer simulated/mock data** or AI-generated content.
4. **Capabilities**: 
   - Interactive UI (Dashboards, Kanbans, Calculators).
   - Data Visualization (Charts using Recharts).
   - AI Features (Chat, Image Gen, Vision, Speech - available via 'ouroboros' hook).

**Modes:**
1. "TAGS": Return JSON Array of 4 distinct, viable app ideas (2-5 words) that fit these constraints. 
   - BAD: "Multiplayer Game" (No backend), "Real Spotify Client" (Auth/API issues).
   - GOOD: "Markdown Note Taker", "Simulated Stock Market", "AI Dream Journal", "Pomodoro Timer".
2. "CONCEPTS": Return JSON Array of 3 detailed app concepts. Format: [{ "title": "...", "description": "...", "prompt": "...", "tag": "..." }]
   - The "prompt" must explicitly mention "Use Simulated data" if a backend would normally be required (e.g. for finance or social apps).
\`;

const FALLBACK_TAGS = ${tagsStr};

export default function IdeaBoard() {
  const { suggestionMode, suggestionModel } = preferences || { suggestionMode: 'generative', suggestionModel: 'gemini-flash-lite-latest' };
  
  const { sendMessage, messages, loading } = useChat({
    mode: 'fast',
    model: suggestionModel, // Use preferred model for suggestions
    systemInstruction: MUSE_SYSTEM
  });
  
  const { trigger } = useAgent();
  
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [tags, setTags] = useState([]);
  const [initializing, setInitializing] = useState(true);

  // Initial Seed
  useEffect(() => {
    // Respect Generative Mode setting
    if (suggestionMode === 'generative') {
        sendMessage("TAGS " + Math.random());
    } else {
        // Use static fallback immediately
        setTags(FALLBACK_TAGS);
        setInitializing(false);
    }
  }, [suggestionMode]);

  useEffect(() => {
    if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'model' && !loading) {
            try {
                // Find JSON array in the response (robust regex for [ ... ])
                const jsonMatch = lastMsg.text.match(/\\[.*\\]/s);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    
                    if (Array.isArray(parsed)) {
                        // Detect if Tags (strings) or Ideas (objects)
                        if (parsed.length > 0 && typeof parsed[0] === 'string') {
                            setTags(parsed.slice(0, 4));
                            setInitializing(false);
                        } else {
                            setIdeas(parsed);
                        }
                    }
                } else {
                   // Force fail to trigger fallback
                   throw new Error("No JSON found");
                }
            } catch (e) {
                console.error("Muse Parse Error", e);
                // If we failed to get tags initially, show fallbacks so UI isn't empty
                if (tags.length === 0) {
                   setTags(FALLBACK_TAGS);
                   setInitializing(false);
                }
            }
        }
    }
  }, [messages, loading]);

  const handleBrainstorm = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setIdeas([]);
    await sendMessage(\`CONCEPTS: "\${input}"\`);
  };

  const handleRefreshTags = () => {
    setTags([]);
    
    if (suggestionMode === 'generative') {
        sendMessage("TAGS " + Math.random());
    } else {
        // Just shuffle or reset static tags
        setTags(FALLBACK_TAGS.sort(() => 0.5 - Math.random()));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
       
       {/* Header */}
       <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-violet-50 dark:bg-violet-900/20 p-2 rounded-lg text-violet-600 dark:text-violet-400">
                <Wand2 size={18} />
             </div>
             <div>
                <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">${t.title}</h2>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">${t.subtitle}</div>
             </div>
          </div>
          {ideas.length > 0 && (
            <button 
                onClick={() => { setIdeas([]); setInput(''); }} 
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <Eraser size={16} />
            </button>
          )}
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6">
          
          {/* Input */}
          <form className="relative w-full mb-8" onSubmit={handleBrainstorm}>
             <input 
               value={input}
               onChange={e => setInput(e.target.value)}
               disabled={loading && !initializing}
               className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-12 text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-400"
               placeholder="${t.placeholder}"
             />
             <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg disabled:opacity-0 transition-opacity"
             >
                 {loading && !initializing ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
             </button>
          </form>

          {/* Quick Tags - Dynamic */}
          {ideas.length === 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">${t.quickStarts}</span>
                    <button onClick={handleRefreshTags} disabled={loading && suggestionMode === 'generative'} className="text-zinc-400 hover:text-violet-500 transition-colors">
                        <RefreshCw size={12} className={loading && tags.length === 0 ? "animate-spin" : ""} />
                    </button>
                </div>
                
                {tags.length === 0 && loading ? (
                     <div className="flex gap-2">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-8 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                        ))}
                     </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {(tags.length > 0 ? tags : FALLBACK_TAGS).map(tag => (
                            <button key={tag} onClick={() => setInput(tag)} className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-violet-400 dark:hover:border-violet-600 transition-colors text-zinc-600 dark:text-zinc-400 animate-in fade-in slide-in-from-bottom-2">
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
              </div>
          )}

          {/* Results */}
          <div className="space-y-3">
             {ideas.map((idea, idx) => (
               <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-violet-400 dark:hover:border-violet-600 transition-colors group animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: \`\${idx * 100}ms\` }}>
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{idea.title}</h3>
                     <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{idea.tag}</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">{idea.description}</p>
                  <button 
                    onClick={() => trigger(idea.prompt)}
                    className="w-full py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold rounded-lg group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap size={12} />
                    <span>${t.build}</span>
                  </button>
               </div>
             ))}
          </div>

       </div>
    </div>
  );
}
`;
