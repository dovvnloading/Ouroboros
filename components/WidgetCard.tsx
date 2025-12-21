

import React, { memo } from 'react';
import { X, Maximize2, Minimize2, RefreshCw, GripHorizontal } from 'lucide-react';
import { LivePreview } from './LivePreview';
import { Tooltip } from './Tooltip';
import { Widget } from '../types';
import { useAccessibility } from '../hooks/useAccessibility';
import { useSettings } from '../hooks/useSettings';
import { translations } from '../utils/i18n';

export interface WidgetCardProps {
  widget: Widget;
  isSelected: boolean;
  onRemove?: (id: string) => void;
  onToggleExpand?: (id: string) => void;
  onRegenerate?: (id: string, prompt: string) => void;
  isDragging?: boolean;
  dragListeners?: any;
  dragAttributes?: any;
  setActivatorNodeRef?: (node: HTMLElement | null) => void;
  scope: Record<string, any>;
}

export const WidgetCard: React.FC<WidgetCardProps> = memo(({ 
  widget, 
  isSelected,
  onRemove, 
  onToggleExpand, 
  onRegenerate, 
  isDragging,
  dragListeners,
  dragAttributes,
  setActivatorNodeRef,
  scope
}) => {
  const isExpanded = widget.expanded;
  const { settings: a11ySettings } = useAccessibility();
  const { settings: appSettings } = useSettings();
  const t = translations[appSettings.language || 'en'].widgetControls;

  // ARTIFACT FIX:
  // We use box-shadow rings instead of physical borders to prevent sub-pixel bleeding during CSS transforms (Zoom).
  // border-zinc-200 -> shadow-[0_0_0_1px_#e4e4e7]
  // border-zinc-800 -> shadow-[0_0_0_1px_#27272a]
  
  const baseShadow = "shadow-[0_0_0_1px_rgba(228,228,231,1)] dark:shadow-[0_0_0_1px_rgba(39,39,42,1)]"; // Zinc-200 / Zinc-800
  const selectedShadow = "shadow-[0_0_0_1px_rgba(39,39,42,1)] dark:shadow-[0_0_0_1px_rgba(244,244,245,1)]"; // Zinc-800 / Zinc-100
  const draggingShadow = "shadow-[0_0_0_2px_rgba(39,39,42,1)] dark:shadow-[0_0_0_2px_rgba(244,244,245,1)]"; // Thick Ring

  return (
    <div 
      className={`
        flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden transition-all duration-200 w-full h-full group/card isolate
        ${isExpanded ? 'z-[9999] shadow-2xl' : ''}
        ${!isExpanded && !isSelected ? `${baseShadow} shadow-sm hover:shadow-md` : ''}
        ${isSelected && !isExpanded ? `${selectedShadow} shadow-xl` : ''}
        ${isDragging ? `${draggingShadow} shadow-2xl cursor-grabbing scale-[1.005]` : ''}
      `}
      style={{
        // Hardware acceleration hints to prevent tearing
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Header */}
      <div 
        ref={!isExpanded ? setActivatorNodeRef : undefined}
        className={`
          relative h-11 px-3 flex items-center justify-between 
          bg-white dark:bg-zinc-900 select-none shrink-0 z-20
          ${!isExpanded ? 'cursor-grab active:cursor-grabbing' : ''}
        `}
        style={{
             // Simulated bottom border to prevent gaps
             boxShadow: '0 1px 0 0 rgba(0,0,0,0.05)'
        }}
        {...(!isExpanded ? dragListeners : {})}
        {...(!isExpanded ? dragAttributes : {})}
      >
        {/* Left: Window Controls */}
        <div className="flex items-center gap-1.5 z-20">
            {onRemove && (
                <Tooltip content={t.close}>
                    <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onRemove(widget.id)}
                    className="group flex items-center justify-center w-6 h-6 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition-colors"
                    aria-label={t.close}
                    >
                        <X size={14} />
                    </button>
                </Tooltip>
            )}
        </div>

        {/* Center: Handle & Title */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             {/* Grip handle visible only on hover when not expanded */}
             {!isExpanded && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <GripHorizontal size={16} />
                 </div>
             )}
             
             {/* Title fades out on hover to show grip */}
             <span className={`text-xs font-semibold text-zinc-600 dark:text-zinc-300 truncate max-w-[200px] transition-opacity duration-200 ${!isExpanded ? 'group-hover/card:opacity-0' : ''}`}>
                {widget.prompt}
            </span>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-1 z-20">
             {onRegenerate && (
                <Tooltip content={t.regenerate}>
                    <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onRegenerate(widget.id, widget.prompt)}
                    className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-300 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    aria-label={t.regenerate}
                    >
                        <RefreshCw size={13} strokeWidth={2.5} />
                    </button>
                </Tooltip>
            )}
            {onToggleExpand && (
                <Tooltip content={isExpanded ? t.collapse : t.expand}>
                    <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onToggleExpand(widget.id)}
                    className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-300 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    aria-label={isExpanded ? t.collapse : t.expand}
                    >
                    {isExpanded ? <Minimize2 size={13} strokeWidth={2.5} /> : <Maximize2 size={13} strokeWidth={2.5} />}
                    </button>
                </Tooltip>
            )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-zinc-50 dark:bg-zinc-950 isolate">
         <LivePreview 
             code={widget.code} 
             scope={scope} 
             title={widget.prompt}
             enableA11yCheck={a11ySettings.screenReader}
         />
         {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}
      </div>
      
    </div>
  );
});
