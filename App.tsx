
import React, { useState } from 'react';
import { IntroSequence } from './components/IntroSequence';
import { LandingPage } from './components/LandingPage';
import Workspace from './components/Workspace';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { useAccessibility } from './hooks/useAccessibility';
import { Widget } from './types';

type AppState = 'BOOT' | 'LANDING' | 'WORKSPACE';

export default function App() {
  // 0. Global Providers
  const { theme, toggleTheme } = useTheme();
  // Initialize accessibility globally so settings persist across views
  useAccessibility();

  // 1. App State
  const [appState, setAppState] = useState<AppState>('BOOT');
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [pendingPreset, setPendingPreset] = useState<Widget[] | null>(null);

  // 2. Settings Management
  const { 
    settings, 
    isSettingsOpen, 
    setIsSettingsOpen, 
    hasConfiguredKey, 
    saveSettings 
  } = useSettings();

  const handleLaunch = (prompt?: string, presetWidgets?: Widget[]) => {
      if (presetWidgets) {
          setPendingPreset(presetWidgets);
      } else if (prompt) {
          setPendingPrompt(prompt);
      }
      setAppState('WORKSPACE');
  };

  // --- RENDER LOGIC ---

  if (appState === 'BOOT') {
      return <IntroSequence onComplete={() => setAppState('LANDING')} />;
  }

  if (appState === 'LANDING') {
      return <LandingPage onLaunch={handleLaunch} apiKey={settings.keys.google} />;
  }

  return (
    <div className="relative h-screen w-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 text-zinc-900 dark:text-zinc-100 animate-in fade-in duration-700 transition-colors">
      <Workspace 
        settings={settings}
        saveSettings={saveSettings}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        hasConfiguredKey={hasConfiguredKey}
        theme={theme}
        toggleTheme={toggleTheme}
        initialPrompt={pendingPrompt}
        initialPreset={pendingPreset}
        onClearLaunchParams={() => {
            setPendingPrompt(null);
            setPendingPreset(null);
        }}
      />
    </div>
  );
}
