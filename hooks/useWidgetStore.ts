
import { useState, useRef, useEffect, useCallback } from 'react';
import { Widget } from '../types';
import { getDefaultCode, getIdeaBoardCode } from '../utils/runtime';
import { translations } from '../utils/i18n';

const DEFAULT_WIDGET_WIDTH = 450;
const DEFAULT_WIDGET_HEIGHT = 500;
const GAP = 20;

export function useWidgetStore(hasConfiguredKey: boolean, language: 'en' | 'es') {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);

  // Refs for access in async functions/event listeners
  const widgetsRef = useRef(widgets);
  const selectedWidgetIdRef = useRef(selectedWidgetId);
  const reservedSpotsRef = useRef<{x: number, y: number}[]>([]);

  useEffect(() => { widgetsRef.current = widgets; }, [widgets]);
  useEffect(() => { selectedWidgetIdRef.current = selectedWidgetId; }, [selectedWidgetId]);
  useEffect(() => { reservedSpotsRef.current = []; }, [widgets]); // Clear reserved spots on update

  // Initialize Default Widgets (System Status + Idea Board)
  useEffect(() => {
    if (hasConfiguredKey && widgets.length === 0) {
       // Only run if empty to prevent overwrites
       const manualTitle = translations[language].manual.title;
       const museTitle = translations[language].muse.title;

       const defaults: Widget[] = [
         {
            id: 'welcome-1',
            code: getDefaultCode(language),
            prompt: manualTitle,
            expanded: false,
            x: 50,
            y: 50,
            width: DEFAULT_WIDGET_WIDTH,
            height: DEFAULT_WIDGET_HEIGHT,
            zIndex: 1
         },
         {
            id: 'idea-board-1',
            code: getIdeaBoardCode(language),
            prompt: museTitle,
            expanded: false,
            x: 520, // Positioned next to System Status (450 + gap)
            y: 50,
            width: DEFAULT_WIDGET_WIDTH,
            height: DEFAULT_WIDGET_HEIGHT,
            zIndex: 1
         }
       ];
       setWidgets(defaults);
    }
  }, [hasConfiguredKey]); // Only re-run if key configuration status changes (initial boot)

  // Layout Logic
  const findPosition = useCallback(() => {
    const currentWidgets = widgetsRef.current;
    const reserved = reservedSpotsRef.current;
    
    const originX = 100;
    const originY = 100;
    const cols = 4; // Preferred width
    
    for (let i = 0; i < 1000; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const x = originX + col * (DEFAULT_WIDGET_WIDTH + GAP);
        const y = originY + row * (DEFAULT_WIDGET_HEIGHT + GAP);

        const hasCollision = [...currentWidgets, ...reserved].some(w => {
           // We cast to any because 'reserved' spots only have x/y, but we treat them as having default size
           const wWidth = (w as any).width || DEFAULT_WIDGET_WIDTH;
           const wHeight = (w as any).height || DEFAULT_WIDGET_HEIGHT;
           return (
             x < w.x + wWidth &&
             x + DEFAULT_WIDGET_WIDTH > w.x &&
             y < w.y + wHeight &&
             y + DEFAULT_WIDGET_HEIGHT > w.y
           );
        });

        if (!hasCollision) return { x, y };
    }
    return { x: originX + 50, y: originY + 50 };
  }, []);

  const reserveSpot = useCallback(() => {
      const pos = findPosition();
      reservedSpotsRef.current.push(pos);
      return pos;
  }, [findPosition]);

  // Organize widgets into a clean grid
  const autoLayoutWidgets = useCallback(() => {
    const startX = 50;
    const startY = 100; // Leave room for header
    
    // Calculate columns based on window width
    const availableWidth = window.innerWidth - (startX * 2);
    // Rough column calculation assuming default width
    const cols = Math.floor(availableWidth / (DEFAULT_WIDGET_WIDTH + GAP));
    const safeCols = Math.max(1, cols);

    setWidgets(prev => {
        // Sort widgets visually (Top-Left to Bottom-Right) to keep logical order
        const sorted = [...prev].sort((a, b) => {
            const rowDiff = a.y - b.y;
            if (Math.abs(rowDiff) > 100) { 
                return rowDiff; 
            }
            return a.x - b.x;
        });

        let currentY = startY;
        let rowHeight = 0;
        let colIndex = 0;

        // Simple row-flow layout algorithm
        return sorted.map((w) => {
            const wWidth = w.width || DEFAULT_WIDGET_WIDTH;
            const wHeight = w.height || DEFAULT_WIDGET_HEIGHT;
            
            // New row if needed
            if (colIndex >= safeCols) {
                colIndex = 0;
                currentY += rowHeight + GAP;
                rowHeight = 0;
            }

            const x = startX + colIndex * (DEFAULT_WIDGET_WIDTH + GAP); // Align to grid columns strictly for x
            const y = currentY;

            rowHeight = Math.max(rowHeight, wHeight);
            colIndex++;

            return {
                ...w,
                x,
                y
            };
        });
    });
  }, []);

  // Actions
  const addWidget = useCallback((widget: Widget) => {
    // Ensure width/height defaults
    const newWidget = {
        ...widget,
        width: widget.width || DEFAULT_WIDGET_WIDTH,
        height: widget.height || DEFAULT_WIDGET_HEIGHT
    };
    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidgetId(widget.id);
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setSelectedWidgetId(prev => prev === id ? null : prev);
  }, []);

  const updateWidgetCode = useCallback((id: string, code: string, prompt: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, code, prompt } : w));
  }, []);

  const resizeWidget = useCallback((id: string, width: number, height: number) => {
      setWidgets(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setSelectedWidgetId(id);
    const widget = widgetsRef.current.find(w => w.id === id);
    // We update zIndex only if strictly needed
    setMaxZIndex(prevMax => {
        if (widget && widget.zIndex === prevMax) return prevMax; 
        const nextZ = prevMax + 1;
        setWidgets(prevWidgets => prevWidgets.map(w => w.id === id ? { ...w, zIndex: nextZ } : w));
        return nextZ;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, expanded: !w.expanded } : w));
    bringToFront(id);
  }, [bringToFront]);

  const reorderWidgets = useCallback((newWidgets: Widget[]) => {
      setWidgets(newWidgets);
  }, []);

  return {
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
  };
}
