import React from 'react';
import { Atom } from 'lucide-react';

export interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Executing quantum state projection...',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 gap-4 text-center ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing orbital pulse */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md animate-ping" />
        <div className="w-16 h-16 rounded-full border border-cyan-500/30 border-t-cyan-400 border-r-purple-500 animate-spin" />
        <Atom className={`absolute ${sizeClasses[size]} text-cyan-400 animate-pulse`} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-200">{message}</p>
        <p className="text-xs text-slate-400">Coherent state simulation in progress</p>
      </div>
    </div>
  );
};
