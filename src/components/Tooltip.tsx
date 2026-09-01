import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 150,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled || !content) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700 border-x-transparent border-b-transparent border-t-4 border-x-4 border-b-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700 border-x-transparent border-t-transparent border-b-4 border-x-4 border-t-0',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700 border-y-transparent border-r-transparent border-l-4 border-y-4 border-r-0',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700 border-y-transparent border-l-transparent border-r-4 border-y-4 border-l-0',
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 pointer-events-none whitespace-normal text-center',
            positionClasses[position]
          )}
        >
          <div
            className={cn(
              'px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-lg border border-gray-700/50 max-w-xs leading-relaxed animate-in fade-in zoom-in-95 duration-150',
              className
            )}
          >
            {content}
            <div className={cn('absolute w-0 h-0', arrowClasses[position])} />
          </div>
        </div>
      )}
    </div>
  );
}
