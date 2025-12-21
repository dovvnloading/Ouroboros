import React, { useEffect, useRef } from 'react';
import { X, Terminal, ChevronRight, Cpu, PenTool, Code, Clock } from 'lucide-react';
import { LogEntry } from '../types';
import { translations } from '../utils/i18n';
import { AppSettings } from './SettingsModal';

interface ProcessLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  settings: AppSettings;
}

export const ProcessLogModal: React.FC<ProcessLogModalProps> = ({ isOpen, onClose, logs, settings }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[settings.language || 'en'].process;

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  const getActorIcon = (actor: string) => {
    switch (actor) {
      case 'Orchestrator': return <Cpu size={14} className="text-purple-400" />;
      case 'Architect': return <PenTool size={14} className="text-blue-400" />;
      case 'Engineer': return <Code size={14} className="text-amber-400" />;
      default: return <Terminal size={14} className="text-zinc-400" />;
    }
  };

  const getActorColor = (actor: string) => {
    switch (actor) {
      case 'Orchestrator': return 'text-purple-400';
      case 'Architect': return 'text-blue-400';
      case 'Engineer': return 'text-amber-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl h-[600px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-sm animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
               <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
               <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
            </div>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <div className="flex items-center gap-2 text-zinc-400">
               <Terminal size={14} />
               <span className="text-xs font-bold tracking-wider uppercase">{t.title}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Console Body */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/50"
        >
          {logs.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2">
                <Terminal size={32} className="opacity-20" />
                <p className="text-xs uppercase tracking-widest">{t.waiting}</p>
             </div>
          )}

          {logs.map((log) => (
            <div key={log.id} className="group animate-in fade-in slide-in-from-left-2 duration-300">
               <div className="flex items-baseline gap-3 mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })}.{new Date(log.timestamp).getMilliseconds().toString().padStart(3, '0')}
                  </span>
                  <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${getActorColor(log.actor)}`}>
                     {getActorIcon(log.actor)}
                     <span>{log.actor}</span>
                  </div>
               </div>
               
               <div className="pl-[5.5rem] relative">
                  {/* Tree line */}
                  <div className="absolute left-[3.5rem] top-0 bottom-0 w-px bg-zinc-800 group-last:hidden" />
                  <div className="absolute left-[3.5rem] top-2 w-4 h-px bg-zinc-800" />

                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{log.message}</p>
                  
                  {log.data && (
                    <div className="mt-2 p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-x-auto">
                       <pre className="text-[10px] text-zinc-500 font-mono">
                         {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                       </pre>
                    </div>
                  )}
               </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/30 text-[10px] text-zinc-500 flex justify-between">
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>{t.status}</span>
           </div>
           <span>root@ouroboros:~</span>
        </div>
      </div>
    </div>
  );
};