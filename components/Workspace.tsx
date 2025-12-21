
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dna, BrainCircuit, Settings, Plus, ZoomIn, ZoomOut, Navigation, Trash2, Bot, PenTool, Code, Keyboard, Command, RefreshCw, Sun, Moon, Library, Microscope, LayoutGrid, Info, Eye, Terminal, Palette, Briefcase, Gamepad2, TrendingUp } from 'lucide-react';

import { CommandBar } from './CommandBar';
import { WidgetGrid, WidgetGridHandle } from './WidgetGrid';
import { SettingsModal, AppSettings } from './SettingsModal';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { HelpModal } from './HelpModal';
import { InfoModal } from './InfoModal';
import { Tooltip } from './Tooltip';
import { VoiceControlLayer } from './VoiceControlLayer';
import { EmergencyMode } from './EmergencyMode';
import { AccessibilityModal } from './AccessibilityModal';
import { ProcessLogModal } from './ProcessLogModal';

// Utilities & Services
import { EventBus } from '../utils/eventBus';
import { useToolbox } from '../hooks/useToolbox';
import { getResearcherPreset, getDesignerPreset, getAnalystPreset, getProductivityPreset, getArcadePreset } from '../utils/presets';
import { Widget } from '../types';
import { matchHotkey, formatShortcut } from '../utils/hotkeys';
import { translations } from '../utils/i18n';

// Hooks
import { useWidgetStore } from '../hooks/useWidgetStore';
import { useAgentSystem } from '../hooks/useAgentSystem';
import { useAccessibility } from '../hooks/useAccessibility';

interface WorkspaceProps {
  settings: AppSettings;
  saveSettings: (s: AppSettings) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  hasConfiguredKey: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initialPrompt: string | null;
  initialPreset: Widget[] | null;
  onClearLaunchParams: () => void;
}

export default function Workspace({
  settings,
  saveSettings,
  isSettingsOpen,
  setIsSettingsOpen,
  hasConfiguredKey,
  theme,
  toggleTheme,
  initialPrompt,
  initialPreset,
  onClearLaunchParams
}: WorkspaceProps) {
  // Access global a11y settings
  const { settings: a11ySettings } = useAccessibility();
  const t = translations[settings.language || 'en'].workspace;
  const tc = translations[settings.language || 'en'].contextMenu;

  // 1. Settings Ref (Sync with prop for async access)
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // 2. Widget Store (State & CRUD) - Now language aware
  const {
    widgets,
    widgetsRef,
    selectedWidgetId,
    selectedWidgetIdRef,
    maxZIndex,
    setMaxZIndex,
    setWidgets,
    setSelectedWidgetId,
    addWidget,
    removeWidget,
    resizeWidget,
    updateWidgetCode,
    toggleExpand,
    bringToFront,
    reorderWidgets,
    reserveSpot,
    autoLayoutWidgets
  } = useWidgetStore(hasConfiguredKey, settings.language || 'en');

  // 3. Agent System (AI Orchestration)
  const {
    loading,
    loadingMessage,
    logs,
    handleAgentRequest,
    updateWidgetInternal,
    regenerateWidget,
    regenerateAll
  } = useAgentSystem({
    settingsRef,
    widgetsRef,
    addWidget,
    updateWidgetCode,
    removeWidget,
    reserveSpot,
    maxZIndex,
    setMaxZIndex,
    setIsSettingsOpen,
    theme
  });

  // 4. UI State (Context Menu & Help & Info & Emergency)
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const [isProcessLogOpen, setIsProcessLogOpen] = useState(false);
  
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, isOpen: boolean}>({ x: 0, y: 0, isOpen: false });
  const [presetMenu, setPresetMenu] = useState<{x: number, y: number, isOpen: boolean}>({ x: 0, y: 0, isOpen: false });
  const [contextMenuTarget, setContextMenuTarget] = useState<string | null>(null);
  
  const gridRef = useRef<WidgetGridHandle>(null);

  // 5. Stable Event Bus & Scope
  const eventBus = useRef(new EventBus());
  
  // AI Toolbox Hooks
  const aiToolbox = useToolbox();

  // Decompose preferences to ensure scope doesn't break on unrelated setting changes (like grid)
  const preferences = useMemo(() => ({
    suggestionMode: settings.suggestions?.mode || 'generative',
    suggestionModel: settings.suggestions?.model || 'gemini-flash-lite-latest',
    language: settings.language || 'en'
  }), [settings.suggestions?.mode, settings.suggestions?.model, settings.language]);

  const agentScope = useMemo(() => ({
    ouroboros: {
      resizeWidget, 
      useAgent: () => ({
        broadcast: (event: string, data: any) => eventBus.current.broadcast(event, data),
        subscribe: (event: string, callback: Function) => eventBus.current.subscribe(event, callback),
        trigger: (prompt: string) => {
          console.log(`[Agent] Triggered by widget: ${prompt}`);
          handleAgentRequest(prompt);
        }
      }),
      // Inject AI Hooks
      useChat: aiToolbox.useChat,
      useImageGen: aiToolbox.useImageGen,
      useVision: aiToolbox.useVision,
      useTTS: aiToolbox.useTTS,
      useTranscribe: aiToolbox.useTranscribe,
      useLiveAPI: aiToolbox.useLiveAPI,
      // User Preferences available to widgets
      preferences
    }
  }), [aiToolbox, handleAgentRequest, resizeWidget, preferences]);

  // 6. Global Event Listeners (Keyboard & Mouse)
  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      
      const target = e.target as HTMLElement;
      // Check if we clicked on a widget
      const widgetEl = target.closest('[data-widget-id]');
      const widgetId = widgetEl?.getAttribute('data-widget-id') || null;
      
      setContextMenuTarget(widgetId);
      setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true });
    };

    const handleGlobalClick = () => {
      setContextMenu(prev => ({ ...prev, isOpen: false }));
      setPresetMenu(prev => ({ ...prev, isOpen: false }));
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 0. Respect Widgets that consumed the event (e.g., Snake Game)
      if (e.defaultPrevented) return;

      // Ignore if user is typing in an input (EXCEPT for Emergency shortcut)
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;
      const keys = settingsRef.current.shortcuts;

      // Emergency Mode (Always active, even in inputs)
      if (matchHotkey(e, keys.emergency)) {
          e.preventDefault();
          setIsEmergencyOpen(prev => !prev);
          return; 
      }

      if (isInput) return;

      // 1. App Actions
      if (matchHotkey(e, keys.agentFocus)) {
          e.preventDefault();
          const input = document.getElementById('agent-input');
          input?.focus();
      }
      if (matchHotkey(e, keys.autoLayout)) {
          e.preventDefault();
          autoLayoutWidgets();
      }
      if (matchHotkey(e, keys.resetView)) {
          e.preventDefault();
          gridRef.current?.resetView();
      }
      if (matchHotkey(e, keys.zoomIn)) {
          e.preventDefault();
          gridRef.current?.zoomIn();
      }
      if (matchHotkey(e, keys.zoomOut)) {
          e.preventDefault();
          gridRef.current?.zoomOut();
      }
      if (matchHotkey(e, keys.help)) {
          e.preventDefault();
          setIsHelpOpen(prev => !prev);
      }
      if (matchHotkey(e, keys.toggleTheme)) {
          e.preventDefault();
          toggleTheme();
      }

      // 2. Widget Selection Actions
      if (selectedWidgetIdRef.current) {
        if (matchHotkey(e, keys.deleteWidget)) {
            removeWidget(selectedWidgetIdRef.current);
            setSelectedWidgetId(null);
        }

        // Nudging (Hardcoded arrow behavior as standard interaction)
        const step = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;

        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          setWidgets(prev => prev.map(w => w.id === selectedWidgetIdRef.current ? { ...w, x: w.x + dx, y: w.y + dy } : w));
        }
      }

      if (e.key === 'Escape') setSelectedWidgetId(null);
    };

    document.addEventListener('contextmenu', handleGlobalContextMenu);
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [autoLayoutWidgets, removeWidget, setWidgets, setSelectedWidgetId, toggleTheme]); 

  // 7. Auto-Launch Effect (Prompts or Presets)
  useEffect(() => {
    if (!loading && hasConfiguredKey) {
        if (initialPreset) {
            setTimeout(() => {
                setWidgets(initialPreset);
                onClearLaunchParams();
            }, 300);
        } else if (initialPrompt) {
            setTimeout(() => {
                // Clear default widgets to ensure a fresh start
                setWidgets([]);
                // Manually sync ref to ensure agent/layout sees empty space immediately
                widgetsRef.current = [];
                
                handleAgentRequest(initialPrompt);
                onClearLaunchParams();
            }, 500);
        }
    }
  }, [initialPrompt, initialPreset, hasConfiguredKey]); 

  // Context Menu Handler
  const handleTriggerAgent = () => {
      const input = document.getElementById('agent-input') as HTMLInputElement;
      if (input) {
          input.focus();
      }
  };

  const handlePresetClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent global click from closing immediately
    const rect = e.currentTarget.getBoundingClientRect();
    setPresetMenu({ x: rect.left, y: rect.bottom + 8, isOpen: true });
  };

  // Build Context Menu Items dynamically
  const menuItems: ContextMenuItem[] = useMemo(() => {
    const keys = settings.shortcuts;
    const baseItems: ContextMenuItem[] = [
        { label: tc.newBlueprint, icon: Plus, onClick: handleTriggerAgent, shortcut: formatShortcut(keys.agentFocus) },
        { separator: true } as any,
        { label: t.autoLayout, icon: LayoutGrid, onClick: autoLayoutWidgets, shortcut: formatShortcut(keys.autoLayout) },
        { label: t.reset, icon: Navigation, onClick: () => gridRef.current?.resetView(), shortcut: formatShortcut(keys.resetView) },
        { separator: true } as any,
        { label: t.settings, icon: Settings, onClick: () => setIsSettingsOpen(true) },
        { label: t.about, icon: Info, onClick: () => setIsInfoOpen(true) },
        { label: tc.commandList, icon: Keyboard, onClick: () => setIsHelpOpen(true), shortcut: formatShortcut(keys.help) },
        { label: tc.wipe, icon: Trash2, danger: true, onClick: () => window.confirm(tc.confirmWipe) && setWidgets([]) }
    ];

    if (contextMenuTarget) {
        const widgetItems: ContextMenuItem[] = [
            { 
                label: tc.regenerate, 
                icon: RefreshCw, 
                onClick: () => regenerateWidget(contextMenuTarget) 
            },
            { 
                label: tc.delete, 
                icon: Trash2, 
                danger: true,
                onClick: () => removeWidget(contextMenuTarget),
                shortcut: formatShortcut(keys.deleteWidget)
            },
            { separator: true } as any
        ];
        return [...widgetItems, ...baseItems];
    }

    return baseItems;
  }, [contextMenuTarget, regenerateWidget, removeWidget, autoLayoutWidgets, settings.shortcuts, t, tc]);

  const presetMenuItems: ContextMenuItem[] = useMemo(() => [
    { 
        label: tc.researcherSuite, 
        icon: Microscope, 
        onClick: () => {
             // Instant Load (localized)
             setWidgets(getResearcherPreset(settings.language || 'en'));
        }
    },
    { 
        label: tc.designerSuite, 
        icon: Palette, 
        onClick: () => {
             // Instant Load (localized)
             setWidgets(getDesignerPreset(settings.language || 'en'));
        }
    },
    { 
        label: tc.analystSuite, 
        icon: TrendingUp, 
        onClick: () => {
             // Instant Load (localized)
             setWidgets(getAnalystPreset(settings.language || 'en'));
        }
    },
    { 
        label: tc.productivitySuite, 
        icon: Briefcase, 
        onClick: () => {
             // Instant Load (localized)
             setWidgets(getProductivityPreset(settings.language || 'en'));
        }
    },
    { 
        label: tc.arcadeSuite, 
        icon: Gamepad2, 
        onClick: () => {
             // Instant Load (localized)
             setWidgets(getArcadePreset(settings.language || 'en'));
        }
    }
  ], [settings.language, tc]);

  const getLoadingIcon = () => {
    const msg = loadingMessage.toLowerCase();
    // Swapped risky icons for safer ones (PenTool, Code) to prevent Error #130 if build is old
    if (msg.includes("orchestrator") || msg.includes("orquestador")) return <Bot className="text-purple-600 w-4 h-4 animate-bounce" />;
    if (msg.includes("architect") || msg.includes("arquitecto")) return <PenTool className="text-blue-600 w-4 h-4 animate-bounce" />;
    if (msg.includes("engineer") || msg.includes("ingeniero")) return <Code className="text-amber-600 w-4 h-4 animate-bounce" />;
    return <BrainCircuit className="text-emerald-600 w-4 h-4 animate-bounce" />;
  };

  const keys = settings.shortcuts;

  return (
    <>
      {/* Voice Access Layer - SOTA Accessibility */}
      <VoiceControlLayer 
        enabled={a11ySettings.voiceAccess} 
        onAgentRequest={handleAgentRequest}
        onEmergency={() => setIsEmergencyOpen(true)}
        settings={settings}
      />

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-6 flex justify-between items-center transition-colors">
         {/* Brand */}
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center shadow-sm">
                <Dna className="text-white dark:text-zinc-900 w-4 h-4" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">Ouroboros</h1>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">{t.subtitle}</span>
            </div>
         </div>

         {/* Controls */}
         <div className="flex items-center gap-2">
            
            {/* Loading Status */}
             <div className="mr-2 flex items-center gap-2">
                {loading && (
                   <div 
                      onClick={() => setIsProcessLogOpen(true)}
                      className="cursor-pointer flex items-center gap-3 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full animate-in fade-in slide-in-from-top-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                   >
                      {getLoadingIcon()}
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{loadingMessage.split(':')[1] || loadingMessage}</span>
                   </div>
                )}
                
                {/* Process Log Toggle */}
                <Tooltip content={t.processLog} side="bottom">
                   <button
                      onClick={() => setIsProcessLogOpen(true)}
                      className={`
                         p-2 rounded-full transition-colors relative
                         ${loading ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                      `}
                   >
                      <Terminal size={18} />
                      {loading && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                   </button>
                </Tooltip>
             </div>

             <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

             {/* Tools */}
             <div className="flex items-center gap-1">
                <Tooltip content={t.presets}>
                    <NavBarButton icon={Library} onClick={handlePresetClick} label={t.presets} />
                </Tooltip>
                
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                <Tooltip content={t.autoLayout} shortcut={formatShortcut(keys.autoLayout)}>
                    <NavBarButton icon={LayoutGrid} onClick={autoLayoutWidgets} label={t.autoLayout} />
                </Tooltip>
                
                <Tooltip content={t.reset} shortcut={formatShortcut(keys.resetView)}>
                    <NavBarButton icon={Navigation} onClick={() => gridRef.current?.resetView()} label={t.reset} />
                </Tooltip>
                
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                <Tooltip content={t.zoomOut} shortcut={formatShortcut(keys.zoomOut)}>
                    <NavBarButton icon={ZoomOut} onClick={() => gridRef.current?.zoomOut()} label={t.zoomOut} />
                </Tooltip>
                <Tooltip content={t.zoomIn} shortcut={formatShortcut(keys.zoomIn)}>
                    <NavBarButton icon={ZoomIn} onClick={() => gridRef.current?.zoomIn()} label={t.zoomIn} />
                </Tooltip>
             </div>

             <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
             
             <Tooltip content={t.accessibility}>
                <NavBarButton icon={Eye} onClick={() => setIsA11yOpen(true)} label={t.accessibility} />
             </Tooltip>

             <Tooltip content={t.theme} shortcut={formatShortcut(keys.toggleTheme)}>
                <NavBarButton icon={theme === 'light' ? Moon : Sun} onClick={toggleTheme} label={t.theme} />
             </Tooltip>
             <Tooltip content={t.about}>
                <NavBarButton icon={Info} onClick={() => setIsInfoOpen(true)} label={t.about} />
             </Tooltip>
             <Tooltip content={t.settings}>
                <NavBarButton icon={Settings} onClick={() => setIsSettingsOpen(true)} label={t.settings} />
             </Tooltip>
         </div>
      </div>

      {/* Main Grid Canvas */}
      <div className="relative z-10 w-full h-full pt-16">
        <WidgetGrid 
          ref={gridRef}
          widgets={widgets}
          selectedWidgetId={selectedWidgetId}
          onRemove={removeWidget} 
          onToggleExpand={toggleExpand}
          onRegenerate={updateWidgetInternal}
          onReorder={reorderWidgets}
          onFocus={bringToFront}
          onTriggerAgent={handleTriggerAgent}
          onOpenSettings={() => setIsSettingsOpen(true)}
          scope={agentScope}
          snapToGrid={settings.snapToGrid}
          gridVisuals={settings.gridVisuals}
        />
      </div>

      {/* Center Command Interface */}
      <CommandBar 
        onSubmit={handleAgentRequest} 
        onRegenerateAll={regenerateAll}
        loading={loading} 
        hasWidgets={widgets.length > 0}
        shortcut={keys.agentFocus}
        settings={settings}
      />

      {/* Overlays */}
      <ContextMenu x={contextMenu.x} y={contextMenu.y} isOpen={contextMenu.isOpen} onClose={() => setContextMenu(prev => ({...prev, isOpen: false}))} items={menuItems} />
      <ContextMenu x={presetMenu.x} y={presetMenu.y} isOpen={presetMenu.isOpen} onClose={() => setPresetMenu(prev => ({...prev, isOpen: false}))} items={presetMenuItems} />
      
      {/* Accessibility Modal */}
      <AccessibilityModal isOpen={isA11yOpen} onClose={() => setIsA11yOpen(false)} settings={settings} />

      {/* Process Log Console */}
      <ProcessLogModal isOpen={isProcessLogOpen} onClose={() => setIsProcessLogOpen(false)} logs={logs} settings={settings} />

      {/* Emergency Overlay - Highest Z-Index */}
      <EmergencyMode isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />

      {!hasConfiguredKey && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[60] bg-white/50 dark:bg-black/50 backdrop-blur-md animate-in fade-in duration-500">
            <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl max-w-md text-center shadow-xl">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-700">
                   <Settings className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t.setupRequired}</h3>
                <p className="text-sm mb-6 text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {t.setupDesc}
                </p>
                <button 
                  onClick={() => setIsSettingsOpen(true)} 
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-all shadow-sm active:scale-95"
                >
                  {t.configure}
                </button>
            </div>
          </div>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={saveSettings} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} settings={settings} />
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} settings={settings} />
    </>
  );
}

// Sub-component for Nav Buttons
function NavBarButton({ icon: Icon, onClick, label }: { icon: any, onClick: (e: React.MouseEvent) => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
      aria-label={label}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  );
}
