import React, { useState, useRef, ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  shortcut?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'top', shortcut }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [actualSide, setActualSide] = useState<'top' | 'bottom'>(side);
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    // Clear any existing timeout to ensure clean state
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // 400ms delay before showing
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const GAP = 8;
        const VIEWPORT_PADDING = 10;
        
        let calculatedSide = side;

        // Boundary Check: If top side is requested but we are too close to the top edge
        // (rect.top is the distance from top of viewport)
        if (side === 'top' && rect.top < (40 + GAP + VIEWPORT_PADDING)) {
            // Assuming tooltip height ~40px. Flip to bottom.
            calculatedSide = 'bottom';
        }

        // Calculate positions
        let top = rect.top - GAP; 
        let left = rect.left + (rect.width / 2);

        if (calculatedSide === 'bottom') {
          top = rect.bottom + GAP;
        }
        
        setCoords({ top, left });
        setActualSide(calculatedSide);
        setIsVisible(true);
      }
    }, 400); 
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Clean up on unmount
  useEffect(() => {
      return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
  }, []);

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {children}
      </div>
      
      {isVisible && ReactDOM.createPortal(
        <div 
          className={`
            fixed z-[99999] px-3 py-1.5 rounded-lg shadow-xl border backdrop-blur-md
            animate-in fade-in zoom-in-95 duration-150
            flex items-center gap-2 pointer-events-none
            text-xs font-medium tracking-wide
            
            /* Light Mode Appearance (High Contrast) */
            bg-zinc-900/90 border-zinc-800 text-zinc-50
            
            /* Dark Mode Appearance (High Contrast) */
            dark:bg-zinc-50/90 dark:border-zinc-200 dark:text-zinc-900
          `}
          style={{ 
            top: coords.top, 
            left: coords.left,
            transform: `translate(-50%, ${actualSide === 'top' ? '-100%' : '0'})` 
          }}
        >
          <span className="whitespace-nowrap">{content}</span>
          {shortcut && (
             <span className="ml-1 px-1.5 py-0.5 rounded bg-white/10 dark:bg-black/5 text-[10px] font-mono opacity-80">
                {shortcut}
             </span>
          )}
          
          {/* Arrow */}
          <div 
            className={`
                absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border
                ${actualSide === 'top' 
                   ? 'bottom-[-5px] border-r border-b bg-zinc-900/90 border-zinc-800 dark:bg-zinc-50/90 dark:border-zinc-200' 
                   : 'top-[-5px] border-l border-t bg-zinc-900/90 border-zinc-800 dark:bg-zinc-50/90 dark:border-zinc-200'
                }
            `}
          />
        </div>,
        document.body
      )}
    </>
  );
};