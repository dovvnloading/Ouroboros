
import React, { useEffect, useState } from 'react';
import { X, Github, Globe, Terminal, ArrowUpRight, Code2, Sparkles, Twitter } from 'lucide-react';
import { translations } from '../utils/i18n';
import { AppSettings } from './SettingsModal';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, settings }) => {
  const [mounted, setMounted] = useState(false);
  const t = translations[settings.language || 'en'].info;
  const tl = translations[settings.language || 'en'].landing;

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ease-out backdrop-blur-sm
      ${isOpen ? 'bg-zinc-900/40 dark:bg-black/60 opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className={`
            relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl 
            border border-zinc-200 dark:border-zinc-800 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
            ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}
        `}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        {/* Header / Close */}
        <div className="absolute top-4 right-4 z-20">
            <button 
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
                <X size={18} />
            </button>
        </div>

        <div className="flex flex-col md:flex-row min-h-[450px]">
            {/* Left: Visual / Identity */}
            <div className="md:w-5/12 bg-zinc-50 dark:bg-zinc-950/50 p-8 flex flex-col justify-between relative overflow-hidden group">
                 {/* Grid Pattern */}
                 <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2]" 
                      style={{ backgroundImage: 'radial-gradient(#a1a1aa 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                 />
                 
                 <div className="relative z-10">
                     <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 transform transition-transform group-hover:scale-105 duration-500">
                        <Terminal size={32} className="text-zinc-900 dark:text-zinc-100" />
                     </div>
                     <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Matthew Wesney</h2>
                     <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">{t.role}</p>
                     
                     <div className="flex flex-wrap gap-2 mt-4">
                        <span className="px-2 py-1 rounded bg-zinc-200/50 dark:bg-zinc-800/50 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-300/50 dark:border-zinc-700/50">
                            React
                        </span>
                        <span className="px-2 py-1 rounded bg-zinc-200/50 dark:bg-zinc-800/50 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-300/50 dark:border-zinc-700/50">
                            TypeScript
                        </span>
                        <span className="px-2 py-1 rounded bg-zinc-200/50 dark:bg-zinc-800/50 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-300/50 dark:border-zinc-700/50">
                            GenAI
                        </span>
                     </div>
                 </div>

                 <div className="relative z-10 mt-12 md:mt-0">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">{t.systemArch}</div>
                    <div className="space-y-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1">
                            <span>{t.core}</span>
                            <span className="text-zinc-900 dark:text-zinc-200">{tl.prototype}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1">
                            <span>{t.runtime}</span>
                            <span className="text-zinc-900 dark:text-zinc-200">React 19</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1">
                            <span>{t.status}</span>
                            <span className="text-emerald-500">{t.operational}</span>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Right: Connect / Links */}
            <div className="flex-1 p-8 md:p-10 flex flex-col relative z-10">
                <div className="mb-8">
                     <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" />
                        {t.aboutTitle}
                     </h3>
                     <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {t.aboutDesc}
                     </p>
                </div>

                <div className="space-y-3 flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">{t.connect}</h3>
                    
                    <a href="https://x.com/d3vaux" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
                                <Twitter size={18} fill="currentColor" className="text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">X (Twitter)</div>
                                <div className="text-xs text-zinc-500">@d3vaux</div>
                            </div>
                        </div>
                        <ArrowUpRight size={16} className="text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                    </a>

                    <a href="https://github.com/dovvnloading" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-[#24292e] dark:bg-white text-white dark:text-[#24292e] flex items-center justify-center">
                                <Github size={20} fill="currentColor" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">GitHub</div>
                                <div className="text-xs text-zinc-500">@dovvnloading</div>
                            </div>
                        </div>
                        <ArrowUpRight size={16} className="text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                    </a>

                     <a href="https://dovvnloading.github.io/" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                                <Globe size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.portfolio}</div>
                                <div className="text-xs text-zinc-500">dovvnloading.github.io</div>
                            </div>
                        </div>
                        <ArrowUpRight size={16} className="text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                    </a>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] text-zinc-400">
                    <div className="flex items-center gap-1.5">
                        <Code2 size={12} />
                        <span className="font-mono">BUILD_ID: 0X8F3A</span>
                    </div>
                    <span>© 2025 Ouroboros Inc.</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
