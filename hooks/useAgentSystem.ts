
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Widget, LogEntry } from '../types';
import { planAgentActions, generateWidgetCode, WidgetSummary } from '../services/geminiService';
import { AppSettings } from '../components/SettingsModal';
import { useAccessibility } from './useAccessibility';
import { translations } from '../utils/i18n';

interface UseAgentSystemProps {
  settingsRef: React.MutableRefObject<AppSettings>;
  widgetsRef: React.MutableRefObject<Widget[]>;
  addWidget: (w: Widget) => void;
  updateWidgetCode: (id: string, code: string, prompt: string) => void;
  removeWidget: (id: string) => void;
  reserveSpot: () => { x: number, y: number };
  maxZIndex: number;
  setMaxZIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsSettingsOpen: (v: boolean) => void;
  theme: 'light' | 'dark';
}

export function useAgentSystem({
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
}: UseAgentSystemProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const loadingRef = useRef(loading);
  const { settings: a11ySettings } = useAccessibility();

  // Keep theme in a ref so we can access current value without rebuilding callbacks
  const themeRef = useRef(theme);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  // Helper to get current translation
  const getT = () => translations[settingsRef.current.language || 'en'].workspace.loading;

  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const addLog = useCallback((actor: LogEntry['actor'], message: string, data?: any) => {
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      actor,
      message,
      data
    }]);
  }, []);

  // Private helper to create a single widget
  const createWidgetInternal = useCallback(async (prompt: string, specificId?: string) => {
    const { x, y } = reserveSpot();
    const newId = specificId || crypto.randomUUID();
    
    try {
      addLog('System', `Initiating creation sequence for: "${prompt}"`);
      const code = await generateWidgetCode(
        prompt, 
        settingsRef.current, 
        themeRef.current, 
        (status) => setLoadingMessage(status),
        a11ySettings,
        (msg, data) => addLog('Architect', msg, data) // Log callback for Architect/Blueprint
      );
      
      addLog('Engineer', 'Compiling React component...', code.substring(0, 150) + "...");
      
      setMaxZIndex(prev => {
          const nextZ = prev + 1;
          addWidget({
            id: newId,
            code,
            prompt,
            expanded: false,
            x,
            y,
            zIndex: nextZ
          });
          return nextZ;
      });
      addLog('System', 'Widget mounted successfully.');
      
    } catch (e: any) {
      console.error("Creation failed", e);
      addLog('System', `Critical Error: ${e.message}`);
      setLoadingMessage("Error: Creation failed");
      await new Promise(r => setTimeout(r, 1000));
    }
  }, [reserveSpot, addWidget, setMaxZIndex, settingsRef, a11ySettings, addLog]);

  // Private helper to update a single widget
  const updateWidgetInternal = useCallback(async (id: string, instruction: string) => {
    const widget = widgetsRef.current.find(w => w.id === id);
    if (!widget) return;

    try {
      addLog('System', `Initiating update for widget [${id}]: "${instruction}"`);
      // If the instruction implies a full reroll, we phrase the prompt accordingly
      const fullPrompt = `Original Prompt: "${widget.prompt}".\nInstruction: ${instruction}.\n\nRe-write the component code completely.`;
      
      const code = await generateWidgetCode(
        fullPrompt, 
        settingsRef.current, 
        themeRef.current, 
        (status) => setLoadingMessage(status),
        a11ySettings,
        (msg, data) => addLog('Architect', msg, data)
      );
      
      addLog('Engineer', 'Refactoring component code...', code.substring(0, 150) + "...");
      updateWidgetCode(id, code, instruction === "Regenerate" ? widget.prompt : instruction);
      addLog('System', 'Widget updated successfully.');

    } catch (e: any) {
      console.error("Update failed", e);
      addLog('System', `Update Error: ${e.message}`);
    }
  }, [widgetsRef, settingsRef, updateWidgetCode, a11ySettings, addLog]);

  const handleAgentRequest = useCallback(async (prompt: string) => {
    if (loadingRef.current) return;
    
    const currentSettings = settingsRef.current;
    if (!currentSettings.keys[currentSettings.provider]) {
      setIsSettingsOpen(true);
      alert(`Please configure an API Key for ${currentSettings.provider} in settings.`);
      return;
    }

    const t = getT();
    setLoading(true);
    setLogs([]); // Clear previous logs on new main request
    setLoadingMessage(`${t.orchestrator}: ${t.analyzing}`);
    addLog('System', `New user request received: "${prompt}"`);

    // --- AUTO-CLEAR DEFAULTS ---
    // User wants defaults gone when they start working.
    // We check for the specific IDs of the default widgets.
    const defaultIds = ['welcome-1', 'idea-board-1'];
    const activeDefaults = widgetsRef.current.filter(w => defaultIds.includes(w.id));
    
    if (activeDefaults.length > 0) {
        addLog('System', 'Clearing onboarding widgets to prepare workspace.');
        activeDefaults.forEach(w => removeWidget(w.id));
    }

    // Use filtered list for planning so the agent sees a clean slate (if only defaults existed)
    // Note: widgetsRef.current won't update until next render, so we filter manually here.
    const effectiveWidgets = widgetsRef.current.filter(w => !defaultIds.includes(w.id));

    try {
      const summaries: WidgetSummary[] = effectiveWidgets.map(w => ({ id: w.id, prompt: w.prompt }));
      
      addLog('Orchestrator', 'Analyzing system state and formulating plan...');
      const plan = await planAgentActions(prompt, summaries, currentSettings);
      
      addLog('Orchestrator', `Plan formulated: ${plan.thought}`, plan.actions);
      console.log("Agent Plan:", plan);

      for (const action of plan.actions) {
        // Small delay for visual pacing in logs and to allow React state to settle if needed
        await new Promise(r => setTimeout(r, 500));

        if (action.type === 'DELETE' && action.id) {
          setLoadingMessage(`${t.orchestrator}: ${t.deleting}`);
          addLog('Orchestrator', `Executing Action: DELETE [${action.id}]`);
          removeWidget(action.id);
          await new Promise(r => setTimeout(r, 300));
        }

        if (action.type === 'CREATE') {
          addLog('Orchestrator', `Executing Action: CREATE "${action.prompt}"`);
          await createWidgetInternal(action.prompt || "New Widget", action.id);
        }

        if (action.type === 'UPDATE' && action.id) {
           addLog('Orchestrator', `Executing Action: UPDATE [${action.id}]`);
           await updateWidgetInternal(action.id, action.prompt || "Update");
        }
      }

    } catch (error: any) {
      console.error("Agent Error:", error);
      addLog('System', `Agent Process Crashed: ${error.message}`);
      alert("Agent encountered an error. Check console.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }, [createWidgetInternal, updateWidgetInternal, removeWidget, widgetsRef, settingsRef, setIsSettingsOpen, addLog]);

  // Public method to regenerate a specific widget
  const regenerateWidget = useCallback(async (id: string) => {
    if (loadingRef.current) return;
    setLoading(true);
    setLogs([]); // Clear logs for clarity
    await updateWidgetInternal(id, "Regenerate this widget. Try a different visual style or layout while keeping functionality.");
    setLoading(false);
    setLoadingMessage("");
  }, [updateWidgetInternal]);

  // Public method to regenerate ALL widgets
  const regenerateAll = useCallback(async () => {
    if (loadingRef.current) return;
    if (widgetsRef.current.length === 0) return;

    const t = getT();
    setLoading(true);
    setLogs([]);
    setLoadingMessage(`${t.orchestrator}: ${t.rerolling}`);
    addLog('Orchestrator', 'Mass Regeneration Triggered.');

    const widgets = [...widgetsRef.current];
    
    // We process sequentially to be safe with rate limits and UI updates
    for (const widget of widgets) {
        setLoadingMessage(`${t.adapting} ${widget.prompt.slice(0, 15)}...`);
        try {
            await updateWidgetInternal(widget.id, "Regenerate this widget completely. Be creative with the design.");
        } catch (e) {
            console.error(e);
        }
        // Small breathing room
        await new Promise(r => setTimeout(r, 800));
    }

    setLoading(false);
    setLoadingMessage("");
  }, [widgetsRef, updateWidgetInternal, addLog]);

  return {
    loading,
    loadingMessage,
    logs,
    handleAgentRequest,
    updateWidgetInternal,
    regenerateWidget,
    regenerateAll
  };
}
