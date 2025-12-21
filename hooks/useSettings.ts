
import { useState, useEffect, useRef } from 'react';
import { AppSettings, Shortcuts } from '../components/SettingsModal';

const DEFAULT_SHORTCUTS: Shortcuts = {
  agentFocus: 'Mod+k',
  autoLayout: 'Shift+l',
  resetView: 'r',
  zoomIn: 'Mod+=',
  zoomOut: 'Mod+-',
  toggleTheme: 'Mod+Shift+t',
  help: 'Shift+?',
  deleteWidget: 'Delete',
  emergency: 'Mod+Shift+e'
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  provider: 'google',
  snapToGrid: true,
  gridVisuals: {
    style: 'dots',
    opacity: 0.4
  },
  keys: {
    google: process.env.API_KEY || '',
    openai: '',
    anthropic: ''
  },
  models: {
    google: 'gemini-2.5-pro',
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-20240620'
  },
  suggestions: {
    mode: 'generative',
    model: 'gemini-2.5-flash-lite'
  },
  shortcuts: DEFAULT_SHORTCUTS
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasConfiguredKey, setHasConfiguredKey] = useState(false);
  
  // Ref is useful for accessing latest settings in async callbacks/event listeners without triggering re-renders
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('ouroboros_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ 
            ...DEFAULT_SETTINGS, 
            ...parsed,
            models: { ...DEFAULT_SETTINGS.models, ...(parsed.models || {}) },
            keys: { ...DEFAULT_SETTINGS.keys, ...(parsed.keys || {}) },
            shortcuts: { ...DEFAULT_SHORTCUTS, ...(parsed.shortcuts || {}) },
            suggestions: { ...DEFAULT_SETTINGS.suggestions, ...(parsed.suggestions || {}) },
            gridVisuals: { ...DEFAULT_SETTINGS.gridVisuals, ...(parsed.gridVisuals || {}) }
        });
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  // Validation
  useEffect(() => {
    const valid = !!(settings.keys[settings.provider]);
    setHasConfiguredKey(valid);
  }, [settings]);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ouroboros_settings', JSON.stringify(newSettings));
  };

  return {
    settings,
    settingsRef,
    isSettingsOpen,
    setIsSettingsOpen,
    hasConfiguredKey,
    saveSettings
  };
}
