import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
  hoverEffect?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  glow = false,
  hoverEffect = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl transition-all duration-200
        ${glow ? 'glass-panel-glow' : 'glass-panel'}
        ${hoverEffect ? 'hover:border-cyan-400/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
