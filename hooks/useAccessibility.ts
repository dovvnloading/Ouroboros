

import { useState, useEffect } from 'react';

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  dyslexicFont: boolean;
  voiceAccess: boolean;
  screenReader: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  dyslexicFont: false,
  voiceAccess: false,
  screenReader: false,
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('ouroboros_a11y');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Reduce Motion
    if (settings.reduceMotion) root.classList.add('a11y-reduce-motion');
    else root.classList.remove('a11y-reduce-motion');

    // High Contrast
    if (settings.highContrast) root.classList.add('a11y-high-contrast');
    else root.classList.remove('a11y-high-contrast');

    // Large Text
    if (settings.largeText) root.classList.add('a11y-large-text');
    else root.classList.remove('a11y-large-text');

    // Dyslexic Font
    if (settings.dyslexicFont) root.classList.add('a11y-dyslexic-font');
    else root.classList.remove('a11y-dyslexic-font');

    localStorage.setItem('ouroboros_a11y', JSON.stringify(settings));
  }, [settings]);

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return { settings, toggleSetting };
}
