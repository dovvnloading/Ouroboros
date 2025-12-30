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
const SafeDndKitUtilities = {
  ...DndKitUtilities,
  CSS: {
    ...(DndKitUtilities.CSS || {}),
    Transform: {
      ...(DndKitUtilities.CSS?.Transform || {}),
      toString: DndKitUtilities.CSS?.Transform?.toString,
      translate3d: (transform: any) => DndKitUtilities.CSS?.Transform?.toString(transform),
    },
    Translate: {
        ...(DndKitUtilities.CSS?.Translate || {}),
        toString: DndKitUtilities.CSS?.Translate?.toString,
        translate3d: (transform: any) => DndKitUtilities.CSS?.Translate?.toString(transform),
    }
  }
};

export const compileComponent = (code: string, scope: Record<string, any> = {}): CompilationResult => {
  try {
    const transpiled = Babel.transform(code, {
      presets: ['env', 'react', 'typescript'],
      filename: 'dynamic.tsx',
    }).code;

    const exports: { default?: React.ComponentType } = {};
    
    const customRequire = (moduleName: string) => {
      if (scope[moduleName]) return scope[moduleName];
      if (moduleName === 'react') return React;
      if (moduleName === 'lucide-react') return LucideReact;
      if (moduleName === 'recharts') return Recharts;
      if (moduleName === '@dnd-kit/core') return DndKitCore;
      if (moduleName === '@dnd-kit/sortable') return DndKitSortable;
      if (moduleName === '@dnd-kit/utilities') return SafeDndKitUtilities;
      if (moduleName === 'ouroboros') return scope['ouroboros'];
      throw new Error(`Module '${moduleName}' is not available.`);
    };

    const functionBody = `
      "use strict";
      ${transpiled}
      return exports;
    `;

    const func = new Function('exports', 'require', 'React', functionBody);
    func(exports, customRequire, React);

    if (!exports.default) {
      return { component: null, error: "No default export found." };
    }

    return { component: exports.default, error: null };
  } catch (err: any) {
    return { component: null, error: err.message };
  }
};

export const getDefaultCode = (lang: 'en' | 'es') => {
  const t = translations[lang].manual;
  return `
import React from 'react';
import * as Lucide from 'lucide-react';

export default function OuroborosBriefing() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 font-sans">
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-4 shrink-0">
         <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
             <Lucide.BookOpen size={20} />
         </div>
         <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100">${t.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
               <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Prototype v0.2.5</span>
            </div>
         </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <section>
          <div className="flex items-center gap-2 mb-3 text-zinc-400 dark:text-zinc-600">
             <Lucide.Terminal size={14} />
             <h2 className="text-[10px] font-bold uppercase tracking-widest">${t.missionTitle}</h2>
          </div>
          <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            <p className="mb-3">${t.missionText1} <strong>Ouroboros</strong>.</p>
            <p>${t.missionText2}</p>
          </div>
        </section>
      </div>
    </div>
  );
}`;
};

export const getIdeaBoardCode = (lang: 'en' | 'es') => {
  const t = translations[lang].muse;
  const tagsStr = JSON.stringify(t.tags);
  return `
import React, { useState, useEffect } from 'react';
import { Wand2, ArrowRight, Loader2 } from 'lucide-react';
import { useChat, useAgent, preferences } from 'ouroboros';

export default function IdeaBoard() {
  const { suggestionMode, suggestionModel } = preferences || { suggestionMode: 'generative' };
  const { sendMessage, messages, loading } = useChat({ mode: 'fast' });
  const { trigger } = useAgent();
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState([]);

  const handleBrainstorm = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    await sendMessage("CONCEPTS: " + input);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 font-sans p-6">
       <div className="flex items-center gap-3 mb-6">
          <Wand2 className="text-violet-500" />
          <h2 className="font-bold text-sm">${t.title}</h2>
       </div>
       <form onSubmit={handleBrainstorm} className="relative mb-4">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            className="w-full p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-sm outline-none" 
            placeholder="${t.placeholder}" 
          />
       </form>
       <div className="flex-1 overflow-y-auto">
          {loading && <Loader2 className="animate-spin mx-auto mt-10 text-zinc-400" />}
       </div>
    </div>
  );
}`;
};
