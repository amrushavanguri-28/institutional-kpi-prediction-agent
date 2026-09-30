import React from 'react';
import { CalculatedKpi } from '../../types/institutional';
import { RiskBadge } from './RiskBadge';
import { TrendIndicator } from './TrendIndicator';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

interface KpiCardProps {
  kpi: CalculatedKpi;
  onNavigate: (navTitle: string) => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({ kpi, onNavigate }) => {
  // Map KPI ID to Navigation Tab
  const navMap: Record<string, string> = {
    admissions: 'Admissions',
    academic_risk: 'Academic Risk',
    publications: 'Faculty Publications',
    research_funding: 'Research Funding',
    faculty_work: 'Faculty Work',
  };

  const isHighRisk = kpi.riskLevel === 'HIGH';
  const isMedRisk = kpi.riskLevel === 'MEDIUM';

  return (
    <div
      className={`relative bg-white rounded-lg border transition-all duration-200 p-5 shadow-xs hover:shadow-md flex flex-col justify-between ${
        isHighRisk
          ? 'border-red-300 ring-1 ring-red-100'
          : isMedRisk
          ? 'border-amber-300 ring-1 ring-amber-50'
          : 'border-slate-200'
      }`}
    >
      <div>
        {/* Top Header: Title & Risk Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {kpi.title}
          </span>
          <RiskBadge level={kpi.riskLevel} size="sm" />
        </div>

        {/* Current Primary Metric */}
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {kpi.formattedCurrent}
          </div>
        </div>

        {/* Previous Period & YoY Change */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <span>Prev: {kpi.formattedPrevious}</span>
          <span className="text-slate-300">•</span>
          <span
            className={`font-semibold ${
              kpi.percentageChange < 0
                ? 'text-rose-600'
                : kpi.percentageChange > 0
                ? 'text-emerald-700'
                : 'text-slate-600'
            }`}
          >
            {kpi.percentageChange > 0 ? `+${kpi.percentageChange}%` : `${kpi.percentageChange}%`} YoY
          </span>
        </div>

        {/* Trend & Summary Note */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <TrendIndicator trend={kpi.trend} size="sm" />
          <span className="text-xs text-slate-400 capitalize">Direction: {kpi.trend}</span>
        </div>

        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {kpi.riskReason}
        </p>
      </div>

      {/* Action CTA */}
      <button
        type="button"
        onClick={() => onNavigate(navMap[kpi.id] || 'Dashboard')}
        className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700 hover:text-indigo-900 group cursor-pointer"
      >
        <span>Examine KPI Data</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
