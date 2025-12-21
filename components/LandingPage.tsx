
import React, { useState } from 'react';
import { 
  ArrowRight, Dna, Layout, PieChart, Calendar, Activity, Eye
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import { Widget } from '../types';
import { AccessibilityModal } from './AccessibilityModal';
import { translations } from '../utils/i18n';
import { useSettings } from '../hooks/useSettings';

interface LandingPageProps {
  onLaunch: (prompt?: string, presetWidgets?: Widget[]) => void;
  apiKey?: string;
}

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, apiKey }) => {
  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const { settings } = useSettings();
  const lang = settings.language || 'en';
  const t = translations[lang].landing;
  const tw = translations[lang].workspace;

  const BLUEPRINTS = [
    {
        icon: Layout,
        title: t.blueprints.kanban.title,
        desc: t.blueprints.kanban.desc,
        prompt: t.blueprints.kanban.prompt
    },
    {
        icon: PieChart,
        title: t.blueprints.finance.title,
        desc: t.blueprints.finance.desc,
        prompt: t.blueprints.finance.prompt
    },
    {
        icon: Calendar,
        title: t.blueprints.calendar.title,
        desc: t.blueprints.calendar.desc,
        prompt: t.blueprints.calendar.prompt
    },
    {
        icon: Activity,
        title: t.blueprints.crypto.title,
        desc: t.blueprints.crypto.desc,
        prompt: t.blueprints.crypto.prompt
    }
  ];

  return (
    <div className="relative w-screen h-full min-h-screen bg-[#fafafa] dark:bg-[#09090b] overflow-auto text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-900 dark:selection:bg-zinc-100 selection:text-white dark:selection:text-zinc-900 pb-20 transition-colors duration-500">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.4] dark:opacity-[0.2]" 
           style={{ backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />

      {/* Header */}
      <header className="relative z-40 flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center shadow-lg shadow-zinc-200 dark:shadow-none">
             <Dna className="text-white dark:text-zinc-900 w-4 h-4" />
           </div>
           <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">Ouroboros</span>
        </div>
        
        <div className="flex items-center gap-4">
            <Tooltip content={tw.accessibility} side="bottom">
              <button 
                onClick={() => setIsA11yOpen(true)}
                className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
              >
                  <Eye size={16} />
              </button>
            </Tooltip>

            <Tooltip content={apiKey ? t.system.online : t.system.missing} side="bottom">
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 pl-3 pr-1.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{apiKey ? t.system.online : t.system.missing}</span>
                <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-400'}`} />
              </div>
            </Tooltip>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-30 flex flex-col items-center justify-center min-h-[calc(100vh-160px)] max-w-7xl mx-auto px-6 py-12">
        
        <div className="text-center mb-16 max-w-2xl mx-auto">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-8">
              <GoogleLogo />
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t.prototype}</span>
           </div>
           
           <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8 leading-[0.9]">
             {t.title}
           </h1>
           
           <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto">
             {t.subtitle} <br className="hidden md:block" />
             {t.poweredBy} <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Gemini</span>.
           </p>

           <div className="mt-10">
              <Tooltip content={t.start} side="bottom">
                <button 
                  onClick={() => onLaunch()}
                  className="group relative flex items-center gap-3 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-2xl font-medium transition-all shadow-[0_4px_20px_rgba(24,24,27,0.2)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(24,24,27,0.3)] hover:-translate-y-1 active:translate-y-0 active:scale-95 mx-auto overflow-hidden"
                >
                   <span className="relative z-10">{t.start}</span>
                   <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                   
                   {/* Shine effect */}
                   <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 dark:via-black/10 to-transparent z-0" />
                </button>
              </Tooltip>
           </div>
        </div>

        {/* Blueprints Grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 px-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
           {BLUEPRINTS.map((bp, i) => (
             <button
                key={i}
                onClick={() => onLaunch(bp.prompt)}
                className="group flex flex-col text-left p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300"
             >
                <div className="flex items-start justify-between mb-4">
                   <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                      <bp.icon size={20} />
                   </div>
                   <ArrowRight size={16} className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">{bp.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{bp.desc}</p>
             </button>
           ))}
        </div>

      </main>

      {/* Footer */}
      <div className="relative z-30 text-center py-8 opacity-50">
         <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-semibold uppercase tracking-widest">{t.designedFor}</p>
      </div>

      <AccessibilityModal isOpen={isA11yOpen} onClose={() => setIsA11yOpen(false)} settings={settings} />
    </div>
  );
};
