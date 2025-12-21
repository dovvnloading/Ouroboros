
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { translations } from '../utils/i18n';
import { useSettings } from '../hooks/useSettings';

interface IntroSequenceProps {
  onComplete: () => void;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'FADE_IN' | 'FADE_OUT'>('FADE_IN');
  const { settings } = useSettings();
  const t = translations[settings.language || 'en'].intro;

  useEffect(() => {
    // 1. Hold for a moment
    const t1 = setTimeout(() => setPhase('FADE_OUT'), 1500);
    // 2. Complete
    const t2 = setTimeout(onComplete, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-opacity duration-500 ease-out ${phase === 'FADE_OUT' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-zinc-200 dark:border-zinc-800 rounded-2xl" />
            <div className="absolute inset-0 border-4 border-zinc-900 dark:border-zinc-100 rounded-2xl border-t-transparent border-l-transparent animate-spin duration-1000" />
            <div className="absolute inset-4 bg-zinc-900 dark:bg-zinc-100 rounded-lg shadow-inner flex items-center justify-center">
                 <div className="w-2 h-2 bg-white dark:bg-zinc-900 rounded-full animate-pulse" />
            </div>
        </div>
        
        <h1 className="text-sm font-bold tracking-widest text-zinc-900 dark:text-zinc-100 uppercase">Ouroboros</h1>
        <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mt-2 tracking-wide">{t.initializing}</p>
      </div>
    </div>
  );
};
