import React from 'react';
import { Loader2 } from 'lucide-react';

export type Button3DVariant = 'cyan' | 'purple' | 'emerald' | 'dark';
export type Button3DSize = 'sm' | 'md' | 'lg';

export interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Button3DVariant;
  size?: Button3DSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const Button3D: React.FC<Button3DProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles: Record<Button3DSize, string> = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-lg gap-1.5 tracking-wide',
    md: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2 tracking-wide',
    lg: 'px-7 py-3.5 text-base font-bold rounded-2xl gap-2.5 tracking-wide'
  };

  const variantClassMap: Record<Button3DVariant, string> = {
    cyan: 'btn-3d-cyan',
    purple: 'btn-3d-purple',
    emerald: 'btn-3d-emerald',
    dark: 'btn-3d-dark'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center select-none relative whitespace-nowrap cursor-pointer
        font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        transition-all duration-150 ease-out
        ${variantClassMap[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed filter-none transform-none shadow-none pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
