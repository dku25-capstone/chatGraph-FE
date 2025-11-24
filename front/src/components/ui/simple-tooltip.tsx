import React, { useState } from "react";

interface SimpleTooltipProps {
  children: React.ReactNode;
  content: string;
}

export const SimpleTooltip = ({ children, content }: SimpleTooltipProps) => {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-xs font-medium text-white bg-gray-900/80 dark:bg-gray-100/90 dark:text-gray-900 rounded-lg shadow-xl backdrop-blur-md whitespace-nowrap z-[60] animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          {content}
          {/* Arrow Indicator */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-inherit rotate-45" />
        </div>
      )}
    </div>
  );
};
