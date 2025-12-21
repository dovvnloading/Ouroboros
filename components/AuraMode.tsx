
import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, X, Move, Shapes, Palette, Activity, Music, Train, Rocket, Cloud, Smile, Play, Box, Puzzle } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { translations } from '../utils/i18n';
import { AppSettings } from './SettingsModal';

// --- Types ---
type TokenType = 'vibe' | 'action' | 'subject';

interface AuraToken {
  id: string;
  label: string;
  type: TokenType;
  icon: any;
  color: string; // Tailwind class partial, e.g., 'blue'
  eli5: string; // Simplified explanation
}

interface AuraModeProps {
  onClose: () => void;
  onSynthesize: (prompt: string) => void;
  isOpen: boolean;
  settings: AppSettings;
}

export const AuraMode: React.FC<AuraModeProps> = ({ onClose, onSynthesize, isOpen, settings }) => {
  const [activeTokens, setActiveTokens] = useState<AuraToken[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [category, setCategory] = useState<TokenType>('subject'); // Default starting tab
  
  // Ensure we fallback safely if language is somehow undefined
  const lang = settings.language || 'en';
  const t = translations[lang].aura;
  
  // Construct dynamic tokens based on language selection
  const TOKENS: AuraToken[] = useMemo(() => [
    // VIBES (Atmosphere)
    { id: 'calm', label: t.tokens.calm, type: 'vibe', icon: Cloud, color: 'sky', eli5: t.tokens.calm_desc },
    { id: 'neon', label: t.tokens.neon, type: 'vibe', icon: Activity, color: 'fuchsia', eli5: t.tokens.neon_desc },
    { id: 'nature', label: t.tokens.nature, type: 'vibe', icon: Box, color: 'emerald', eli5: t.tokens.nature_desc },
    { id: 'dark', label: t.tokens.dark, type: 'vibe', icon: Sparkles, color: 'zinc', eli5: t.tokens.dark_desc },
    
    // ACTIONS (Mechanics)
    { id: 'sort', label: t.tokens.sort, type: 'action', icon: Shapes, color: 'amber', eli5: t.tokens.sort_desc },
    { id: 'watch', label: t.tokens.watch, type: 'action', icon:  Play, color: 'red', eli5: t.tokens.watch_desc },
    { id: 'make', label: t.tokens.make, type: 'action', icon: Palette, color: 'violet', eli5: t.tokens.make_desc },
    { id: 'track', label: t.tokens.track, type: 'action', icon: Move, color: 'orange', eli5: t.tokens.track_desc },

    // SUBJECTS (Special Interests)
    { id: 'trains', label: t.tokens.trains, type: 'subject', icon: Train, color: 'slate', eli5: t.tokens.trains_desc },
    { id: 'space', label: t.tokens.space, type: 'subject', icon: Rocket, color: 'indigo', eli5: t.tokens.space_desc },
    { id: 'music', label: t.tokens.music, type: 'subject', icon: Music, color: 'rose', eli5: t.tokens.music_desc },
    { id: 'fun', label: t.tokens.fun, type: 'subject', icon: Smile, color: 'yellow', eli5: t.tokens.fun_desc },
  ], [t]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
        setActiveTokens([]);
        setIsSynthesizing(false);
    }
  }, [isOpen]);

  const addToken = (token: AuraToken) => {
    if (activeTokens.length >= 6) return; // Limit complexity
    // Add unique ID for animation keying
    const instance = { ...token, instanceId: Math.random().toString() };
    setActiveTokens(prev => [...prev, instance as any]);
  };

  const removeToken = (index: number) => {
    setActiveTokens(prev => prev.filter((_, i) => i !== index));
  };

  const handleSynthesize = () => {
    if (activeTokens.length === 0) return;
    setIsSynthesizing(true);

    // 1. Extract semantics
    const vibes = activeTokens.filter(t => t.type === 'vibe').map(t => t.label).join(', ');
    const actions = activeTokens.filter(t => t.type === 'action').map(t => t.label).join(', ');
    const subjects = activeTokens.filter(t => t.type === 'subject').map(t => t.label).join(', ');

    // 2. Determine Functional Archetype to prevent "Slop"
    // We map abstract actions to concrete software patterns.
    let technicalDirective = "Interactive Dashboard";
    if (actions.includes(t.tokens.sort)) technicalDirective = "Drag-and-Drop Sorting Grid or Kanban";
    else if (actions.includes(t.tokens.make)) technicalDirective = "Canvas Builder / Generative Art Creator";
    else if (actions.includes(t.tokens.track)) technicalDirective = "Data Visualizer / Counter / Logger";
    else if (actions.includes(t.tokens.watch)) technicalDirective = "Simulation / Auto-running visualizer";

    // 3. Special case handling for complex subjects
    if (subjects.includes(t.tokens.music)) technicalDirective += " + Web Audio API Step Sequencer (Synth)";
    if (subjects.includes(t.tokens.space) || subjects.includes(t.tokens.trains)) technicalDirective += " + Interactive Comparison Tool or Simulation";

    // 4. Construct Rigid Engineering Prompt
    const prompt = `
      [AURA MODE ACTIVE]
      TARGET AUDIENCE: Neurodivergent / Sensory-Seeking.
      LANGUAGE: ${lang === 'es' ? 'Spanish' : 'English'}

      **FUNCTIONAL SPECIFICATION**:
      - Build a "${technicalDirective}".
      - Theme: ${subjects || 'Abstract Concepts'}.
      - Vibe: ${vibes || 'Neutral'}.

      **STRICT QUALITY RULES**:
      1. NO "Placeholder" content. If you build a dinosaur app, include REAL dinosaur data (names, eras, sizes) in a constant array.
      2. NO "Static Info Pages". The app must be a TOOL or a TOY.
      3. IF "Music" is selected: You MUST write a working Web Audio API synthesizer. Do not just put play buttons that do nothing.
      4. IF "Sort" is selected: Use @dnd-kit to make items draggable.
      5. UI: Use large touch targets (>48px). Avoid walls of text. Use Icons.
      6. DATA: Simulate deep data. Do not use "Lorem Ipsum".
      
      GOAL: A fully functional, satisfying, high-fidelity interactive widget.
    `;

    setTimeout(() => {
        onSynthesize(prompt);
        onClose();
    }, 1500); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in duration-500">
       
       {/* Top Bar */}
       <div className="flex justify-between items-center p-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Puzzle className="text-white w-5 h-5 animate-pulse" />
             </div>
             <div>
                 <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{t.title}</h1>
                 <p className="text-xs text-zinc-500 font-medium">{t.subtitle}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={24} />
          </button>
       </div>

       {/* Main Canvas (The Field) */}
       <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
           
           {/* Background Ambiance */}
           <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-[100px] animate-pulse duration-[4000ms]" />
           </div>

           {/* The Core / Synthesis Button */}
           <div className="relative z-10 mb-12">
               {activeTokens.length > 0 ? (
                   <button 
                     onClick={handleSynthesize}
                     className={`
                        relative w-48 h-48 rounded-full flex flex-col items-center justify-center
                        bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900
                        shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500
                        ${isSynthesizing ? 'animate-ping' : ''}
                     `}
                   >
                       {isSynthesizing ? (
                           <Puzzle size={48} className="animate-spin duration-[3000ms]" />
                       ) : (
                           <>
                             <Puzzle size={32} className="mb-2" />
                             <span className="text-sm font-bold tracking-widest uppercase">{t.manifest}</span>
                           </>
                       )}
                       
                       {/* Orbiting Tokens */}
                       {activeTokens.map((token: any, i) => {
                           const angle = (i / activeTokens.length) * 2 * Math.PI;
                           const radius = 140; // Distance from center
                           return (
                               <div 
                                 key={token.instanceId}
                                 className="absolute w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-100 dark:border-zinc-700 flex items-center justify-center animate-in zoom-in duration-300"
                                 style={{
                                     top: '50%',
                                     left: '50%',
                                     transform: `translate(calc(-50% + ${Math.cos(angle) * radius}px), calc(-50% + ${Math.sin(angle) * radius}px))`,
                                 }}
                               >
                                  <token.icon size={20} className={`text-${token.color}-500`} />
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); removeToken(i); }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 hover:opacity-100"
                                  >
                                      <X size={10} />
                                  </button>
                               </div>
                           )
                       })}
                   </button>
               ) : (
                   <div className="w-48 h-48 rounded-full border-4 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                       <span className="text-xs font-medium uppercase tracking-widest text-center px-4">{t.dragText}</span>
                   </div>
               )}
           </div>

           {/* Current Token List (Textual Backup) */}
           <div className="h-12 flex gap-2 items-center justify-center">
              {activeTokens.map((t: any, i) => (
                  <span key={i} className="text-xs font-bold text-zinc-400 dark:text-zinc-500 animate-in fade-in slide-in-from-bottom-2">
                      {t.label} {i < activeTokens.length - 1 && " + "}
                  </span>
              ))}
           </div>

       </div>

       {/* The Palette (Bottom Sheet) */}
       <div className="h-1/3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-6 z-20">
           
           {/* Category Tabs */}
           <div className="flex justify-center gap-4">
               {[
                   { id: 'subject', label: t.categories.subject, icon: Box },
                   { id: 'action', label: t.categories.action, icon: Play },
                   { id: 'vibe', label: t.categories.vibe, icon: Palette },
               ].map((cat) => (
                   <button
                     key={cat.id}
                     onClick={() => setCategory(cat.id as TokenType)}
                     className={`
                        flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all
                        ${category === cat.id 
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg scale-105' 
                            : 'bg-white dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}
                     `}
                   >
                       <cat.icon size={16} />
                       {cat.label}
                   </button>
               ))}
           </div>

           {/* Token Grid */}
           <div className="flex-1 overflow-x-auto custom-scrollbar p-4">
               <div className="flex gap-4 min-w-max mx-auto pt-6">
                   {TOKENS.filter(t => t.type === category).map((token) => (
                       <Tooltip key={token.id} content={token.eli5} side="top">
                           <button
                             onClick={() => addToken(token)}
                             className={`
                                relative flex flex-col items-center justify-center gap-3 w-28 h-28 rounded-2xl
                                bg-white dark:bg-zinc-800 border-2 border-transparent hover:border-${token.color}-400 dark:hover:border-${token.color}-500
                                shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group
                             `}
                           >
                               <div className={`
                                   p-3 rounded-xl bg-${token.color}-50 dark:bg-${token.color}-900/20 
                                   text-${token.color}-600 dark:text-${token.color}-400
                                   group-hover:scale-110 transition-transform
                               `}>
                                   <token.icon size={32} strokeWidth={1.5} />
                               </div>
                               <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{token.label}</span>
                           </button>
                       </Tooltip>
                   ))}
               </div>
           </div>
       </div>

    </div>
  );
};
