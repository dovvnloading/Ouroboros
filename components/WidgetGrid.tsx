

import React, { useState, useRef, memo, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  DragEndEvent,
  PointerSensor,
} from '@dnd-kit/core';
import { Widget } from '../types';
import { DraggableWidget } from './DraggableWidget';
import { useTheme } from '../hooks/useTheme';

export interface WidgetGridHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

interface WidgetGridProps {
  widgets: Widget[];
  selectedWidgetId: string | null;
  onRemove: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onRegenerate: (id: string, prompt: string) => void;
  onReorder: (widgets: Widget[]) => void;
  onFocus: (id: string) => void;
  onTriggerAgent: () => void;
  onOpenSettings: () => void;
  scope: Record<string, any>;
  snapToGrid: boolean;
  gridVisuals: {
    style: 'dots' | 'lines';
    opacity: number;
  };
}

export const WidgetGrid = memo(forwardRef<WidgetGridHandle, WidgetGridProps>(({ 
    widgets, selectedWidgetId, onRemove, onToggleExpand, onRegenerate, onReorder, onFocus, onTriggerAgent, onOpenSettings, scope, snapToGrid, gridVisuals
}, ref) => {
  // Consolidated View State for atomic updates
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const { theme } = useTheme();
  
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const id = active.id as string;
    const GRID_SIZE = 20;

    const widget = widgets.find(w => w.id === id);
    if (widget) {
       // Apply scale correction to the delta
       const adjustedDeltaX = delta.x / view.scale;
       const adjustedDeltaY = delta.y / view.scale;

       let newX = widget.x + adjustedDeltaX;
       let newY = widget.y + adjustedDeltaY;

       if (snapToGrid) {
           newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
           newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
       }

       const newWidgets = widgets.map(w => {
         if (w.id === id) {
           return {
             ...w,
             x: newX,
             y: newY
           };
         }
         return w;
       });
       onReorder(newWidgets);
    }
  };

  // --- Zoom & Pan Logic ---

  const applyZoom = (delta: number, center: { x: number, y: number }) => {
    setView(prev => {
        const newScale = Math.min(Math.max(prev.scale + delta, 0.1), 4);
        const ratio = newScale / prev.scale;
        
        return {
            scale: newScale,
            x: center.x - (center.x - prev.x) * ratio,
            y: center.y - (center.y - prev.y) * ratio
        };
    });
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => applyZoom(0.2, { x: window.innerWidth / 2, y: window.innerHeight / 2 }),
    zoomOut: () => applyZoom(-0.2, { x: window.innerWidth / 2, y: window.innerHeight / 2 }),
    resetView: () => setView({ x: 0, y: 0, scale: 1 })
  }));

  // Non-passive wheel listener for zoom-to-cursor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
        e.preventDefault(); 
        
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            const zoomSensitivity = -0.002;
            applyZoom(e.deltaY * zoomSensitivity, { x: e.clientX, y: e.clientY });
        } else {
            // Pan
            setView(prev => ({
                ...prev,
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => container.removeEventListener('wheel', handleWheelNative);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || isSpacePressed || (e.button === 0 && e.target === containerRef.current)) {
        setIsPanning(true);
        lastPos.current = { x: e.clientX, y: e.clientY };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        e.preventDefault();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setView(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    // Only handle Space for panning here. Zoom/Reset is handled by App.tsx global listener via refs.
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT') {
            setIsSpacePressed(true);
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            setIsSpacePressed(false);
            setIsPanning(false);
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const cursorStyle = isPanning ? 'cursor-grabbing' : isSpacePressed ? 'cursor-grab' : 'cursor-default';
  
  // -- Dynamic Grid Logic --
  const style = gridVisuals?.style || 'dots';
  const opacity = gridVisuals?.opacity ?? 0.4;
  
  // Base Colors: Dark (Zinc-800: 39, 39, 42), Light (Zinc-300: 212, 212, 216)
  const color = theme === 'dark' 
    ? `rgba(39, 39, 42, ${opacity})` 
    : `rgba(212, 212, 216, ${opacity})`;

  let bgImage = `radial-gradient(${color} 1px, transparent 1px)`; // Default Dots
  if (style === 'lines') {
      bgImage = `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`;
  }

  const bgSize = style === 'lines' ? '40px 40px' : '24px 24px';

  return (
    <div 
      className="relative w-full h-full overflow-hidden isolate bg-zinc-50 dark:bg-zinc-950 transition-colors"
    >
      
      {/* Interactive Background Layer */}
      <div 
        ref={containerRef}
        className={`absolute inset-0 z-0 touch-none outline-none ${cursorStyle}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Infinite Grid Pattern */}
         <div 
            className="absolute -top-[10000px] -left-[10000px] w-[20000px] h-[20000px] pointer-events-none transition-transform duration-75 ease-out will-change-transform"
            style={{ 
              transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
              transformOrigin: '10000px 10000px', 
              backgroundImage: bgImage, 
              backgroundSize: bgSize,
            }} 
        />
      </div>

      {/* Widget Layer */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none transition-transform duration-75 ease-out will-change-transform z-10"
        style={{ 
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
            transformOrigin: '0 0'
        }}
      >
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {widgets.map((widget) => (
            <div key={widget.id} className={`pointer-events-auto ${isSpacePressed ? 'pointer-events-none' : ''}`}>
                <DraggableWidget
                  widget={widget}
                  isSelected={widget.id === selectedWidgetId}
                  onRemove={onRemove}
                  onToggleExpand={onToggleExpand}
                  onRegenerate={onRegenerate}
                  onFocus={onFocus}
                  onResize={scope.ouroboros ? (scope.ouroboros as any).resizeWidget : undefined}
                  scope={scope}
                  zoom={view.scale}
                  snapToGrid={snapToGrid}
                />
            </div>
          ))}
        </DndContext>
      </div>

    </div>
  );
}));