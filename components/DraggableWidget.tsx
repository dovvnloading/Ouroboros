

import React, { memo, useState, useCallback, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Widget } from '../types';
import { WidgetCard } from './WidgetCard';
import { ArrowDownRight } from 'lucide-react';

export interface DraggableWidgetProps {
  widget: Widget;
  isSelected: boolean;
  onRemove: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onRegenerate: (id: string, prompt: string) => void;
  onFocus: (id: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
  scope: Record<string, any>;
  zoom: number;
  snapToGrid: boolean;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = memo(({ widget, isSelected, onRemove, onToggleExpand, onRegenerate, onFocus, onResize, scope, zoom, snapToGrid }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging, setActivatorNodeRef } = useDraggable({
    id: widget.id,
  });

  // Local state for resizing to ensure 60fps performance without re-rendering the whole grid
  const [localSize, setLocalSize] = useState<{width: number, height: number} | null>(null);
  const isResizingRef = useRef(false);
  const startPosRef = useRef<{x: number, y: number} | null>(null);
  const startSizeRef = useRef<{width: number, height: number} | null>(null);

  // Resize Handlers
  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set resizing flag to disable other interactions if needed
    isResizingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { 
        width: widget.width || 450, 
        height: widget.height || 500 
    };

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    // Initial local size set
    setLocalSize({ 
        width: widget.width || 450, 
        height: widget.height || 500 
    });
  }, [widget.width, widget.height]);

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!isResizingRef.current || !startPosRef.current || !startSizeRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();

    // Calculate delta considering zoom level
    const deltaX = (e.clientX - startPosRef.current.x) / zoom;
    const deltaY = (e.clientY - startPosRef.current.y) / zoom;

    let newWidth = Math.max(300, startSizeRef.current.width + deltaX);
    let newHeight = Math.max(300, startSizeRef.current.height + deltaY);

    if (snapToGrid) {
        const GRID_SIZE = 20;
        newWidth = Math.round(newWidth / GRID_SIZE) * GRID_SIZE;
        newHeight = Math.round(newHeight / GRID_SIZE) * GRID_SIZE;
    }

    setLocalSize({ width: newWidth, height: newHeight });
  }, [zoom, snapToGrid]);

  const handleResizeEnd = useCallback((e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    
    isResizingRef.current = false;
    startPosRef.current = null;
    startSizeRef.current = null;

    // Commit final size to store
    if (localSize && onResize) {
        onResize(widget.id, localSize.width, localSize.height);
    }
    
    // Clear local state so we revert to props (which should update shortly)
    // We keep it briefly if there's a delay, but setting to null ensures source of truth is store
    setLocalSize(null);
  }, [widget.id, localSize, onResize]);


  // Adjust transform for scale to ensure drag preview keeps up with cursor visually
  const adjustedTransform = transform ? {
    ...transform,
    x: transform.x / zoom,
    y: transform.y / zoom,
  } : null;

  // Use local size if resizing, otherwise props
  const displayWidth = localSize ? localSize.width : (widget.width || 450);
  const displayHeight = localSize ? localSize.height : (widget.height || 500);

  const style: React.CSSProperties = widget.expanded ? {
    position: 'fixed',
    top: 20,
    left: 20,
    right: 20,    
    bottom: 20,
    zIndex: 9999, 
    transform: 'none'
  } : {
    position: 'absolute',
    left: widget.x,
    top: widget.y,
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    zIndex: isDragging ? 9998 : widget.zIndex,
    transform: adjustedTransform ? `translate3d(${adjustedTransform.x}px, ${adjustedTransform.y}px, 0)` : undefined,
    touchAction: 'none',
    // Performance optimization hints
    willChange: isDragging || localSize ? 'transform, width, height' : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onPointerDown={() => onFocus(widget.id)}
      data-widget-id={widget.id}
      className="group/widget"
    >
      <WidgetCard 
        widget={widget}
        isSelected={isSelected}
        onRemove={onRemove}
        onToggleExpand={onToggleExpand}
        onRegenerate={onRegenerate}
        isDragging={isDragging}
        dragListeners={listeners}
        dragAttributes={attributes}
        setActivatorNodeRef={setActivatorNodeRef}
        scope={scope}
      />

      {/* Resize Handle */}
      {!widget.expanded && (
        <div
            className={`
               absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-50
               flex items-end justify-end p-1 opacity-0 group-hover/widget:opacity-100 transition-opacity
            `}
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
        >
            {/* Visual Indicator */}
            <ArrowDownRight size={16} className="text-zinc-400 dark:text-zinc-500" />
        </div>
      )}
    </div>
  );
});