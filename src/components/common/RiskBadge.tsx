import React from 'react';
import { RiskLevel } from '../../types/institutional';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showIcon = true }) => {
  const config = {
    HIGH: {
      label: 'HIGH RISK',
      bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
      icon: ShieldAlert,
    },
    MEDIUM: {
      label: 'MEDIUM RISK',
      bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      icon: AlertTriangle,
    },
    LOW: {
      label: 'LOW RISK',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      icon: CheckCircle2,
    },
  }[level] || {
    label: 'UNKNOWN',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertTriangle,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-semibold tracking-wide',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wider',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border uppercase select-none ${config.bg} ${sizeClasses}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};
