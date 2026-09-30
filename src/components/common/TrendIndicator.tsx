import React from 'react';
import { TrendDirection } from '../../types/institutional';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  trend: TrendDirection;
  changePercent?: number;
  size?: 'sm' | 'md';
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  trend,
  changePercent,
  size = 'md',
}) => {
  const isDeclining = trend === 'Declining';
  const isIncreasing = trend === 'Increasing';

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${
        isDeclining
          ? 'text-rose-600'
          : isIncreasing
          ? 'text-emerald-700'
          : 'text-slate-600'
      } ${textSize}`}
    >
      {isIncreasing && <TrendingUp className={iconSize} />}
      {isDeclining && <TrendingDown className={iconSize} />}
      {!isIncreasing && !isDeclining && <Minus className={iconSize} />}
      <span>{trend}</span>
      {changePercent !== undefined && (
        <span className="text-slate-500 font-normal">
          ({changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`})
        </span>
      )}
    </span>
  );
};
