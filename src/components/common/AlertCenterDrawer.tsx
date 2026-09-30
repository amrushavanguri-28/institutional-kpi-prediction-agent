import React, { useState } from 'react';
import { useInstitutional } from '../../context/InstitutionalContext';
import { RiskBadge } from './RiskBadge';
import {
  X,
  Bell,
  CheckCheck,
  Filter,
  ShieldAlert,
  ArrowRight,
  Check,
} from 'lucide-react';
import { RiskLevel } from '../../types/institutional';

export const AlertCenterDrawer: React.FC = () => {
  const {
    isAlertsOpen,
    setIsAlertsOpen,
    alerts,
    markAlertReviewed,
    markAllAlertsReviewed,
    setActiveNavigation,
  } = useInstitutional();

  const [severityFilter, setSeverityFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [kpiFilter, setKpiFilter] = useState<string>('ALL');

  if (!isAlertsOpen) return null;

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false;
    if (kpiFilter !== 'ALL' && alert.kpiId !== kpiFilter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Institutional Alert Center</h2>
              <div className="text-[11px] text-slate-500">
                Early warnings and automated threshold triggers
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAlertsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3 border-b border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filter Alerts
            </span>
            <button
              type="button"
              onClick={markAllAlertsReviewed}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as reviewed
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-800 text-xs"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low / Info</option>
            </select>

            <select
              value={kpiFilter}
              onChange={(e) => setKpiFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-800 text-xs"
            >
              <option value="ALL">All KPIs</option>
              <option value="admissions">Admissions</option>
              <option value="academic_risk">Academic Risk</option>
              <option value="publications">Faculty Publications</option>
              <option value="research_funding">Research Funding</option>
              <option value="faculty_work">Faculty Work</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No alerts match the selected filters.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-lg border text-xs transition-all ${
                  alert.reviewed
                    ? 'bg-slate-50/60 border-slate-200 opacity-75'
                    : alert.severity === 'HIGH'
                    ? 'bg-red-50/50 border-red-200 ring-1 ring-red-100'
                    : alert.severity === 'MEDIUM'
                    ? 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-100'
                    : 'bg-emerald-50/50 border-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <RiskBadge level={alert.severity} size="sm" />
                    <span className="font-semibold text-slate-500 text-[10px]">
                      {alert.kpiName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                </div>

                <div className="font-bold text-slate-900 mb-1">{alert.title}</div>
                <p className="text-slate-600 leading-relaxed mb-3">{alert.message}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNavigation(alert.navTarget);
                      setIsAlertsOpen(false);
                    }}
                    className="text-indigo-700 hover:text-indigo-900 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {!alert.reviewed ? (
                    <button
                      type="button"
                      onClick={() => markAlertReviewed(alert.id)}
                      className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Check className="w-3 h-3 text-slate-400" />
                      Mark Reviewed
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Reviewed</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <button
            type="button"
            onClick={() => setIsAlertsOpen(false)}
            className="w-full py-2 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Close Alert Center
          </button>
        </div>
      </div>
    </div>
  );
};
