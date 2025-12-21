

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Cpu, Key, AlertCircle, ChevronDown, Bot, Zap, Brain, Keyboard, Command, Globe, Sparkles, LayoutGrid, Grid3X3, Laptop, Search } from 'lucide-react';
import { formatShortcut, recordHotkey } from '../utils/hotkeys';
import { translations } from '../utils/i18n';

export type AIProvider = 'google' | 'openai' | 'anthropic';

export const AVAILABLE_MODELS = {
  google: [
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Preview)' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite' }
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
  ]
};

export interface Shortcuts {
  agentFocus: string;
  autoLayout: string;
  resetView: string;
  zoomIn: string;
  zoomOut: string;
  toggleTheme: string;
  help: string;
  deleteWidget: string;
  emergency: string;
}

export interface AppSettings {
  language: 'en' | 'es';
  provider: AIProvider;
  snapToGrid: boolean;
  gridVisuals: {
    style: 'dots' | 'lines';
    opacity: number;
  };
  keys: {
    google: string;
    openai: string;
    anthropic: string;
  };
  models: {
    google: string;
    openai: string;
    anthropic: string;
  };
  suggestions: {
    mode: 'generative' | 'preselected';
    model: string;
  };
  shortcuts: Shortcuts;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

// --- Custom Components ---

const CustomSelect = ({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: { id: string, name: string }[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o.id === value) || options[0];

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/50 border rounded-xl transition-all duration-200 outline-none
          ${isOpen ? 'border-zinc-800 dark:border-zinc-100 ring-2 ring-zinc-800/5 dark:ring-zinc-100/5' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}
        `}
      >
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{selected?.name || value}</span>
        <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top p-1 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setIsOpen(false); }}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors text-left
                ${opt.id === value ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white'}
              `}
            >
              <span>{opt.name}</span>
              {opt.id === value && <Check size={14} className="text-zinc-900 dark:text-white" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomInput = ({ value, onChange, placeholder, type = "text", icon: Icon }: { value: string, onChange: (v: string) => void, placeholder?: string, type?: string, icon?: any }) => (
    <div className="relative group w-full">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
             <Icon size={16} />
          </div>
        )}
        <input 
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`
              w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-800 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-800/10 dark:focus:ring-zinc-100/10 transition-all placeholder-zinc-400 dark:placeholder-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600
              ${Icon ? 'pl-11 pr-4' : 'px-4'}
            `}
        />
    </div>
);

const ShortcutRecorder = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
}) => {
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const recorded = recordHotkey(e);
      if (recorded) {
        onChange(recorded);
        setIsRecording(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, onChange]);

  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 group">
       <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{label}</span>
       <button
         onClick={() => setIsRecording(true)}
         className={`
            relative min-w-[120px] px-4 py-2 rounded-lg text-xs font-mono border transition-all shadow-sm
            ${isRecording 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 animate-pulse ring-2 ring-red-500/20' 
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-200'}
         `}
       >
          {isRecording ? 'Press keys...' : (formatShortcut(value) || 'None')}
       </button>
    </div>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'intelligence' | 'shortcuts'>('general');
  const t = translations[localSettings.language || 'en'].settings;
  const th = translations[localSettings.language || 'en'].help;
  const tw = translations[localSettings.language || 'en'].workspace;
  const tc = translations[localSettings.language || 'en'].contextMenu;

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleKeyChange = (provider: AIProvider, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      keys: { ...prev.keys, [provider]: value }
    }));
  };

  const handleModelChange = (provider: AIProvider, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      models: { ...prev.models, [provider]: value }
    }));
  };

  const handleShortcutChange = (key: keyof Shortcuts, value: string) => {
     setLocalSettings(prev => ({
         ...prev,
         shortcuts: { ...prev.shortcuts, [key]: value }
     }));
  };

  const handleProviderSelect = (provider: AIProvider) => {
    setLocalSettings(prev => ({ ...prev, provider }));
  };
  
  const handleLanguageChange = (lang: string) => {
    setLocalSettings(prev => ({ ...prev, language: lang as 'en' | 'es' }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[80vh] bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 ring-1 ring-black/5">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-zinc-50/50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
           
           <div className="p-6 pb-2">
               <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-sm">
                        <Cpu className="text-white dark:text-zinc-900 w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">{t.title}</span>
               </div>
           </div>

           <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
               <button 
                  onClick={() => setActiveTab('general')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'general' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
               >
                   <Laptop size={18} />
                   {t.tabs.general}
               </button>
               <button 
                  onClick={() => setActiveTab('intelligence')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'intelligence' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
               >
                   <Brain size={18} />
                   {t.tabs.intelligence}
               </button>
               <button 
                  onClick={() => setActiveTab('shortcuts')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'shortcuts' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
               >
                   <Keyboard size={18} />
                   {t.tabs.keyboard}
               </button>
           </nav>

           <div className="p-6 mt-auto">
              <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30">
                  <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-2">
                      <Sparkles size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">{t.proTip}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                     {t.proTipDesc}
                  </p>
              </div>
           </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950">
            
            {/* Header */}
            <div className="h-20 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-8 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                        {activeTab === 'general' && t.tabs.general}
                        {activeTab === 'intelligence' && t.tabs.intelligence}
                        {activeTab === 'shortcuts' && t.tabs.keyboard}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t.subtitle}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                
                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="max-w-3xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Language */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-4 h-4 text-zinc-400" />
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t.language}</label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomSelect 
                                    value={localSettings.language} 
                                    onChange={handleLanguageChange}
                                    options={[
                                        { id: 'en', name: 'English (US)' },
                                        { id: 'es', name: 'Español (Spanish)' }
                                    ]}
                                />
                            </div>
                        </section>

                        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                        {/* Behavior */}
                        <section className="space-y-6">
                             <div className="flex items-center gap-2 mb-2">
                                <LayoutGrid className="w-4 h-4 text-zinc-400" />
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t.behavior}</label>
                             </div>

                             <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                                <div>
                                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{t.snapToGrid}</div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t.snapDesc}</div>
                                </div>
                                <button
                                    onClick={() => setLocalSettings(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }))}
                                    className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${localSettings.snapToGrid ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white dark:bg-zinc-900 shadow-sm transition-transform ${localSettings.snapToGrid ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                             </div>

                             <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">{t.grid.style}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setLocalSettings(prev => ({...prev, gridVisuals: {...prev.gridVisuals, style: 'dots'}}))}
                                        className={`flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-sm font-medium border transition-all ${localSettings.gridVisuals?.style === 'dots' ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                                    >
                                        <div className="w-4 h-4 rounded-full border-2 border-current opacity-60"></div>
                                        {t.grid.dots}
                                    </button>
                                    <button
                                        onClick={() => setLocalSettings(prev => ({...prev, gridVisuals: {...prev.gridVisuals, style: 'lines'}}))}
                                        className={`flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-sm font-medium border transition-all ${localSettings.gridVisuals?.style === 'lines' ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                                    >
                                        <Grid3X3 size={16} />
                                        {t.grid.lines}
                                    </button>
                                </div>
                             </div>

                             <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.grid.opacity}</label>
                                    <span className="text-xs font-mono text-zinc-500">{Math.round((localSettings.gridVisuals?.opacity || 0.4) * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05"
                                    value={localSettings.gridVisuals?.opacity || 0.4}
                                    onChange={(e) => setLocalSettings(prev => ({...prev, gridVisuals: {...prev.gridVisuals, opacity: parseFloat(e.target.value)}}))}
                                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                                />
                             </div>
                        </section>

                        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                        {/* Suggestions */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-zinc-400" />
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t.suggestions.title}</label>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setLocalSettings(prev => ({...prev, suggestions: {...prev.suggestions, mode: 'generative'}}))}
                                    className={`relative p-4 rounded-xl border text-left transition-all ${localSettings.suggestions?.mode === 'generative' ? 'bg-violet-50 dark:bg-violet-900/10 border-violet-500 text-violet-700 dark:text-violet-300' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                                >
                                    <div className="font-bold text-sm mb-1">{t.suggestions.generative}</div>
                                    <div className="text-xs opacity-80 leading-relaxed">{t.suggestions.generativeDesc}</div>
                                    {localSettings.suggestions?.mode === 'generative' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-500 animate-pulse" />}
                                </button>
                                <button
                                    onClick={() => setLocalSettings(prev => ({...prev, suggestions: {...prev.suggestions, mode: 'preselected'}}))}
                                    className={`relative p-4 rounded-xl border text-left transition-all ${localSettings.suggestions?.mode === 'preselected' ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 text-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                                >
                                    <div className="font-bold text-sm mb-1">{t.suggestions.preselected}</div>
                                    <div className="text-xs opacity-80 leading-relaxed">{t.suggestions.preselectedDesc}</div>
                                </button>
                            </div>
                        </section>
                    </div>
                )}


                {/* INTELLIGENCE TAB */}
                {activeTab === 'intelligence' && (
                    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Provider Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(['google', 'openai', 'anthropic'] as AIProvider[]).map((p) => {
                                const isActive = localSettings.provider === p;
                                const Icon = { google: Zap, openai: Brain, anthropic: Bot }[p];
                                const label = { google: 'Google Gemini', openai: 'OpenAI GPT', anthropic: 'Anthropic Claude' }[p];
                                
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handleProviderSelect(p)}
                                        className={`
                                            relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 group
                                            ${isActive 
                                            ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 shadow-xl scale-[1.02]' 
                                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
                                        `}
                                    >
                                        <div className={`p-3 rounded-full ${isActive ? 'bg-white/10 dark:bg-black/10' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                            <Icon size={24} className={isActive ? 'text-white dark:text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'} />
                                        </div>
                                        <span className="font-bold text-sm">{label}</span>
                                        {isActive && (
                                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                        {/* Configuration Form */}
                        <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
                             <div className="flex items-center gap-2 mb-2">
                                <Key className="w-4 h-4 text-zinc-400" />
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t.credentials}</label>
                            </div>

                            {/* Google */}
                            {localSettings.provider === 'google' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.apiKey}</label>
                                        <CustomInput 
                                            value={localSettings.keys.google} 
                                            onChange={(v) => handleKeyChange('google', v)} 
                                            placeholder="AIzaSy..." 
                                            type="password" 
                                            icon={Key}
                                        />
                                        <p className="text-xs text-zinc-500 pl-1">{t.getKey} <a href="https://aistudio.google.com/" target="_blank" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">Google AI Studio</a></p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.model}</label>
                                        <CustomSelect 
                                            value={localSettings.models.google}
                                            options={AVAILABLE_MODELS.google}
                                            onChange={(v) => handleModelChange('google', v)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* OpenAI */}
                            {localSettings.provider === 'openai' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.apiKey}</label>
                                        <CustomInput 
                                            value={localSettings.keys.openai} 
                                            onChange={(v) => handleKeyChange('openai', v)} 
                                            placeholder="sk-proj-..." 
                                            type="password" 
                                            icon={Key}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.model}</label>
                                        <CustomSelect 
                                            value={localSettings.models.openai}
                                            options={AVAILABLE_MODELS.openai}
                                            onChange={(v) => handleModelChange('openai', v)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Anthropic */}
                            {localSettings.provider === 'anthropic' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.apiKey}</label>
                                        <CustomInput 
                                            value={localSettings.keys.anthropic} 
                                            onChange={(v) => handleKeyChange('anthropic', v)} 
                                            placeholder="sk-ant-..." 
                                            type="password" 
                                            icon={Key}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.model}</label>
                                        <CustomSelect 
                                            value={localSettings.models.anthropic}
                                            options={AVAILABLE_MODELS.anthropic}
                                            onChange={(v) => handleModelChange('anthropic', v)}
                                        />
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <span className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">{t.browserWarning}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SHORTCUTS TAB */}
                {activeTab === 'shortcuts' && (
                    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-start gap-3">
                            <Command className="w-5 h-5 text-zinc-400 mt-0.5" />
                            <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.shortcutNote }} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                            <div className="space-y-2">
                                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">System</div>
                                <ShortcutRecorder label="Emergency Mode" value={localSettings.shortcuts.emergency} onChange={v => handleShortcutChange('emergency', v)} />
                                <ShortcutRecorder label="Agent Command Bar" value={localSettings.shortcuts.agentFocus} onChange={v => handleShortcutChange('agentFocus', v)} />
                                <ShortcutRecorder label={tw.theme} value={localSettings.shortcuts.toggleTheme} onChange={v => handleShortcutChange('toggleTheme', v)} />
                                <ShortcutRecorder label={th.title} value={localSettings.shortcuts.help} onChange={v => handleShortcutChange('help', v)} />
                            </div>
                            
                            <div className="space-y-2">
                                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">Workspace</div>
                                <ShortcutRecorder label={tw.autoLayout} value={localSettings.shortcuts.autoLayout} onChange={v => handleShortcutChange('autoLayout', v)} />
                                <ShortcutRecorder label={tw.reset} value={localSettings.shortcuts.resetView} onChange={v => handleShortcutChange('resetView', v)} />
                                <ShortcutRecorder label={tw.zoomIn} value={localSettings.shortcuts.zoomIn} onChange={v => handleShortcutChange('zoomIn', v)} />
                                <ShortcutRecorder label={tw.zoomOut} value={localSettings.shortcuts.zoomOut} onChange={v => handleShortcutChange('zoomOut', v)} />
                                <ShortcutRecorder label={tc.delete} value={localSettings.shortcuts.deleteWidget} onChange={v => handleShortcutChange('deleteWidget', v)} />
                            </div>
                        </div>

                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="h-20 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end px-8 gap-4 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                <button 
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                    {t.cancel}
                </button>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-8 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-zinc-200/50 dark:shadow-black/50 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Check size={16} />
                    {t.save}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};
