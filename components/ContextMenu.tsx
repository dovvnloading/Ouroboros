
import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, isOpen, onClose, items }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  useLayoutEffect(() => {
    if (isOpen) {
      let newX = x;
      let newY = y;
      
      if (menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect();
        const width = rect.width || 220; 
        const height = rect.height || (items.length * 40);

        const padding = 12;
        if (newX + width > window.innerWidth - padding) {
          newX = window.innerWidth - width - padding;
        }
        if (newY + height > window.innerHeight - padding) {
          newY = window.innerHeight - height - padding;
        }
      }
      setPosition({ x: newX, y: newY });
    }
  }, [x, y, isOpen, items.length]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      ref={menuRef}
      className={`
        fixed min-w-[220px] pointer-events-auto
        bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl dark:shadow-black/50
        py-1.5 overflow-hidden
      `}
      style={{ 
          top: position.y, 
          left: position.x,
          zIndex: 999999
      }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => {
        if (item.separator) {
            return <div key={index} className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />;
        }
        
        return (
            <button
            key={index}
            onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                onClose();
            }}
            className={`
                w-full flex items-center gap-2.5 px-3 py-1.5 text-sm font-medium 
                transition-colors duration-150 group
                ${item.danger 
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'}
            `}
            >
            {item.icon && (
                <item.icon 
                    className={`w-4 h-4 ${item.danger ? 'text-red-500 dark:text-red-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} 
                />
            )}
            
            <span className="flex-1 text-left">{item.label}</span>
            
            {item.shortcut && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-tighter">
                    {item.shortcut}
                </span>
            )}
            </button>
        );
      })}
    </div>,
    document.body
  );
};
