
import React from 'react';
import { X, Keyboard, Command, MousePointer2, Move } from 'lucide-react';
import { AppSettings } from './SettingsModal';
import { formatShortcut } from '../utils/hotkeys';
import { translations } from '../utils/i18n';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

const ShortcutRow = ({ label, shortcut }: { label: string, shortcut: string }) => {
  const parts = formatShortcut(shortcut).split('+').map(p => p.trim());
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
        <span className="text-zinc-600 dark:text-zinc-400 text-sm">{label}</span>
        <div className="flex gap-1">
        {parts.map((k, i) => (
            <span key={i} className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs font-medium text-zinc-500 dark:text-zinc-400 min-w-[24px] text-center shadow-sm">
            {k}
            </span>
        ))}
        </div>
    </div>
  );
};

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, settings }) => {
  const t = translations[settings.language || 'en'].help;
  const tk = t.keys;
  const shortcuts = settings.shortcuts;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/20 dark:bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <Keyboard className="text-zinc-900 dark:text-zinc-100 w-5 h-5" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900">
          
          <div className="space-y-6">
            
            {/* System Section */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-zinc-900 dark:text-zinc-100">
                <Command size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t.system}</h3>
              </div>
              <div className="bg-zinc-50/50 dark:bg-zinc-800/20 rounded-lg border border-zinc-100 dark:border-zinc-800 px-4">
                <ShortcutRow label={tk.emergency} shortcut={shortcuts.emergency} />
                <ShortcutRow label={tk.agent} shortcut={shortcuts.agentFocus} />
                <ShortcutRow label={tk.theme} shortcut={shortcuts.toggleTheme} />
                <ShortcutRow label={tk.help} shortcut={shortcuts.help} />
              </div>
            </div>

            {/* Navigation Section */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-zinc-900 dark:text-zinc-100">
                <Move size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t.navigation}</h3>
              </div>
              <div className="bg-zinc-50/50 dark:bg-zinc-800/20 rounded-lg border border-zinc-100 dark:border-zinc-800 px-4">
                <ShortcutRow label={tk.pan} shortcut="Space + Drag" />
                <ShortcutRow label={tk.zoomIn} shortcut={shortcuts.zoomIn} />
                <ShortcutRow label={tk.zoomOut} shortcut={shortcuts.zoomOut} />
                <ShortcutRow label={tk.reset} shortcut={shortcuts.resetView} />
                <ShortcutRow label={tk.autoLayout} shortcut={shortcuts.autoLayout} />
              </div>
            </div>

            {/* Widget Control Section */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-zinc-900 dark:text-zinc-100">
                <MousePointer2 size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t.widgets}</h3>
              </div>
              <div className="bg-zinc-50/50 dark:bg-zinc-800/20 rounded-lg border border-zinc-100 dark:border-zinc-800 px-4">
                <ShortcutRow label={tk.select} shortcut="Click" />
                <ShortcutRow label={tk.delete} shortcut={shortcuts.deleteWidget} />
                <ShortcutRow label={tk.deselect} shortcut="Esc" />
                <ShortcutRow label={tk.nudge} shortcut="Arrows" />
                <ShortcutRow label={tk.fastNudge} shortcut="Shift + Arrows" />
              </div>
            </div>

          </div>
        </div>
        
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Prototype - Google Ai Labs v0.2.5 • {t.footer}
            </p>
        </div>
      </div>
    </div>
  );
};
