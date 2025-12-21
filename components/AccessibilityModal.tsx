
import React, { useEffect, useRef } from 'react';
import { X, Eye, Type, Zap, Activity, Check, Mic, Speech } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';
import { AppSettings } from './SettingsModal';
import { translations } from '../utils/i18n';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose, settings }) => {
  const { settings: a11ySettings, toggleSetting } = useAccessibility();
  const t = translations[settings.language || 'en'].accessibility;
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and Escape key handling
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const OptionRow = ({ 
    label, 
    description, 
    active, 
    onClick, 
    icon: Icon 
  }: { 
    label: string, 
    description: string, 
    active: boolean, 
    onClick: () => void, 
    icon: any 
  }) => (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group
        ${active 
          ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 shadow-md' 
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-100'}
      `}
      role="switch"
      aria-checked={active}
    >
      <div className="flex items-center gap-4 text-left">
        <div className={`p-2.5 rounded-lg ${active ? 'bg-white/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
           <Icon size={20} />
        </div>
        <div>
           <div className="font-bold text-sm">{label}</div>
           <div className={`text-xs ${active ? 'text-white/80 dark:text-zinc-900/80' : 'text-zinc-500'}`}>{description}</div>
        </div>
      </div>
      
      <div className={`
         w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
         ${active ? 'border-white dark:border-zinc-900 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'border-zinc-300 dark:border-zinc-600'}
      `}>
         {active && <Check size={14} strokeWidth={3} />}
      </div>
    </button>
  );

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/20 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-label={t.title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400">
                <Eye size={20} />
            </div>
            <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.title}</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-zinc-50/50 dark:bg-zinc-950/50 space-y-4">
           
           <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2">{t.beta}</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                 {t.voiceDesc}
              </p>
           </div>

           <OptionRow 
              label={t.voiceLabel}
              description={t.voiceHelp}
              active={a11ySettings.voiceAccess} 
              onClick={() => toggleSetting('voiceAccess')}
              icon={Mic}
           />

           <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4" />

           <OptionRow 
              label={t.screenReaderLabel}
              description={t.screenReaderHelp}
              active={a11ySettings.screenReader} 
              onClick={() => toggleSetting('screenReader')}
              icon={Speech}
           />
           <OptionRow 
              label={t.motionLabel}
              description={t.motionHelp}
              active={a11ySettings.reduceMotion} 
              onClick={() => toggleSetting('reduceMotion')}
              icon={Activity}
           />
           <OptionRow 
              label={t.contrastLabel}
              description={t.contrastHelp}
              active={a11ySettings.highContrast} 
              onClick={() => toggleSetting('highContrast')}
              icon={Zap}
           />
           <OptionRow 
              label={t.textLabel}
              description={t.textHelp}
              active={a11ySettings.largeText} 
              onClick={() => toggleSetting('largeText')}
              icon={Type}
           />
           <OptionRow 
              label={t.dyslexicLabel}
              description={t.dyslexicHelp}
              active={a11ySettings.dyslexicFont} 
              onClick={() => toggleSetting('dyslexicFont')}
              icon={Type}
           />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center">
             <p className="text-[10px] text-zinc-400">{t.footer}</p>
        </div>
      </div>
    </div>
  );
};
