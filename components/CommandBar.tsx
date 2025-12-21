
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Loader2, Command, Dices } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { formatShortcut } from '../utils/hotkeys';
import { AppSettings } from './SettingsModal';
import { translations } from '../utils/i18n';

interface CommandBarProps {
  onSubmit: (prompt: string) => Promise<void>;
  onRegenerateAll: () => void;
  loading: boolean;
  hasWidgets: boolean;
  shortcut: string;
  settings: AppSettings;
}

export const CommandBar: React.FC<CommandBarProps> = ({ onSubmit, onRegenerateAll, loading, hasWidgets, shortcut, settings }) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[settings.language || 'en'].command;

  useEffect(() => {
    // Auto focus on mount
    inputRef.current?.focus();
    // Global shortcut is handled by App.tsx, but we handle Escape locally to blur
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            inputRef.current?.blur();
            setIsFocused(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    await onSubmit(input);
    setInput("");
    inputRef.current?.blur();
    setIsFocused(false);
  };

  const formattedShortcut = formatShortcut(shortcut);
  const displayKey = formattedShortcut.split('+').pop() || 'K';

  return (
    <div className={`
        fixed left-0 right-0 z-40 flex justify-center px-4 pointer-events-none transition-all duration-300 ease-out
        ${isFocused ? 'bottom-8' : 'bottom-6'}
    `}>
      <div className={`
          w-full max-w-2xl relative pointer-events-auto transition-transform duration-300
          ${isFocused ? 'scale-105' : 'scale-100'}
      `}>
        
        {/* Shadow layer */}
        <div className={`
            absolute top-4 left-4 right-4 bottom-0 rounded-2xl bg-black/5 dark:bg-black/50 blur-xl transition-opacity duration-300
            ${isFocused ? 'opacity-100' : 'opacity-50'}
        `} />

        <form 
          onSubmit={handleSubmit}
          className={`
            relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg transition-all duration-300
            ${isFocused ? 'ring-2 ring-zinc-900/10 dark:ring-zinc-100/10' : 'hover:border-zinc-300 dark:hover:border-zinc-700'}
          `}
        >
          {/* Icon Area */}
          <div className="pl-4 flex items-center justify-center text-zinc-400 shrink-0">
            {loading ? (
                <Loader2 className="animate-spin w-5 h-5 text-zinc-500 dark:text-zinc-400" /> 
            ) : (
                <Sparkles className={`w-5 h-5 transition-colors ${isFocused ? 'text-zinc-800 dark:text-zinc-200' : ''}`} />
            )}
          </div>

          {/* Input */}
          <input
            id="agent-input"
            ref={inputRef}
            type="text"
            value={input}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? t.generating : t.placeholder}
            className="flex-1 bg-transparent border-none outline-none px-4 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-medium text-lg h-14 font-sans"
            disabled={loading}
            autoComplete="off"
          />

          {/* Right Action */}
          <div className="flex items-center gap-2 pr-2">
             {/* Reroll Button */}
             {!input && hasWidgets && !loading && (
                <Tooltip content={t.regenerate} side="top">
                    <button
                        type="button"
                        onClick={onRegenerateAll}
                        className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <Dices size={18} />
                    </button>
                </Tooltip>
             )}

             {!input && !loading && (
                 <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <Command size={10} className="text-zinc-400" />
                    <span className="text-[10px] font-mono font-bold text-zinc-400">{displayKey}</span>
                 </div>
             )}

             {input && (
                <Tooltip content={t.execute} side="top">
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </Tooltip>
             )}
          </div>
        </form>
      </div>
    </div>
  );
};
