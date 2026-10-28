import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button3D } from './Button3D';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Circuit Decoherence Error',
  message,
  onRetry,
  className = ''
}) => {
  return (
    <div
      role="alert"
      className={`p-5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-rose-300">{title}</h4>
          <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button3D
          variant="dark"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="shrink-0"
        >
          Re-evaluate
        </Button3D>
      )}
    </div>
  );
};
