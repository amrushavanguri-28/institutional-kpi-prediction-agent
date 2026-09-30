import React, { useState } from 'react';
import { useInstitutional } from '../context/InstitutionalContext';
import { KpiCard } from '../components/common/KpiCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { WorkflowBanner } from '../components/layout/WorkflowBanner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  BrainCircuit,
  FileText,
  Calendar,
  Sparkles,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { formatINR } from '../utils/analyticsEngine';

export const DashboardView: React.FC = () => {
  const {
    calculatedKpis,
    currentSituationNarrative,
    emergingRisks,
    historicalData,
    setActiveNavigation,
    academicYear,
  } = useInstitutional();

  // State for Historical Trend period toggle: 3 years, 4 years, 5 years
  const [historyYearRange, setHistoryYearRange] = useState<3 | 4 | 5>(4);

  const displayedHistoricalData = React.useMemo(() => {
    return historicalData.slice(-historyYearRange);
  }, [historicalData, historyYearRange]);

  // Detected risks list for Section 6
  const detectedRisks = React.useMemo(() => {
    return calculatedKpis.filter((k) => k.riskLevel === 'HIGH' || k.riskLevel === 'MEDIUM');
  }, [calculatedKpis]);

  const navMap: Record<string, string> = {
    admissions: 'Admissions',
    academic_risk: 'Academic Risk',
    publications: 'Faculty Publications',
    research_funding: 'Research Funding',
    faculty_work: 'Faculty Work',
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Visual Workflow Pipeline Banner */}
      <WorkflowBanner />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              Executive Dashboard
            </span>
            <span className="text-xs text-slate-400">• AY {academicYear} Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Institutional Overview
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            AI-powered monitoring, risk detection and predictive insights
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveNavigation('AI Assistant')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult AI Agent</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNavigation('Reports')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Report</span>
          </button>
        </div>
      </div>

      {/* Section 4: Five Primary KPI Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Primary Institutional Performance Indicators
          </h2>
          <span className="text-xs text-slate-400">
            Automated evaluation against accreditation norms
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {calculatedKpis.map((kpi) => (
            <KpiCard
              key={kpi.id}
              kpi={kpi}
              onNavigate={(navTarget) => setActiveNavigation(navTarget)}
            />
          ))}
        </div>
      </section>

      {/* Section 5: Current Institutional Situation */}
      <section className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-slate-100">
              Current Institutional Situation
            </h2>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded font-mono">
            Status: Synthesized from Live Dataset
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {currentSituationNarrative.map((statement, idx) => (
            <div
              key={idx}
              className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/80 leading-relaxed text-slate-300 flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p>{statement}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: Risk Overview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Risk Overview</h2>
            <p className="text-xs text-slate-500">
              Immediate operational vulnerabilities and variance alerts requiring governance intervention
            </p>
          </div>
          <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
            {detectedRisks.length} Areas Identified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {detectedRisks.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <RiskBadge level={kpi.riskLevel} size="md" />
                  <span className="text-xs text-slate-400 font-medium">AY {academicYear}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{kpi.title}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg font-bold text-slate-800">{kpi.formattedCurrent}</span>
                  <span
                    className={`text-xs font-semibold ${
                      kpi.percentageChange < 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    ({kpi.percentageChange > 0 ? `+${kpi.percentageChange}%` : `${kpi.percentageChange}%`})
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-100 mb-4">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Risk Root Cause:
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{kpi.riskReason}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <TrendIndicator trend={kpi.trend} size="sm" />
                <button
                  type="button"
                  onClick={() => setActiveNavigation(navMap[kpi.id] || 'Dashboard')}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7: Historical Trend Analysis */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Historical Trends</h2>
            <p className="text-xs text-slate-500">
              Longitudinal tracking across multi-year academic cycles (Increasing, Stable, or Declining)
            </p>
          </div>

          {/* 3 / 4 / 5 Year Range Filter Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs self-start sm:self-auto">
            <span className="text-slate-500 px-2 font-medium">Timeline:</span>
            {[3, 4, 5].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setHistoryYearRange(yr as any)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  historyYearRange === yr
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {yr} Years
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Admissions vs High-Risk Students */}
          <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Admissions Trend vs Academic Risk
                </h4>
                <div className="text-[11px] text-slate-500">
                  Intake count vs students meeting early warning risk threshold
                </div>
              </div>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                Admissions: Declining
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayedHistoricalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} domain={[2500, 4500]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#e11d48' }} domain={[10, 60]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="admissions"
                    name="Admissions (Seats Filled)"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="highRiskStudents"
                    name="High-Risk Students"
                    stroke="#e11d48"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Research Funding & Work Completion */}
          <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Research Funding (INR Cr) & Publications
                </h4>
                <div className="text-[11px] text-slate-500">
                  Extramural grants sanctioned vs indexed papers
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                Funding: Declining
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayedHistoricalData.map((d) => ({
                    ...d,
                    fundingInCr: Math.round((d.researchFundingInr / 10000000) * 100) / 100,
                  }))}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} unit=" Cr" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#059669' }} domain={[120, 220]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val, name) => [name === 'Research Funding' ? `₹${val} Cr` : val, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar yAxisId="left" dataKey="fundingInCr" name="Research Funding" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="publications" name="Faculty Publications" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Emerging Risk Prediction */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Emerging Risk Prediction & Early Warnings
              </h2>
              <p className="text-xs text-slate-500">
                Predictive risk projection derived from longitudinal trends and current status
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-white px-3 py-1 rounded border border-slate-200">
            Methodology: Dynamic Trend Extrapolation
          </span>
        </div>

        {/* Disclaimer Note */}
        <div className="mb-5 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Predictive Model Disclaimer:</strong> Institutional predictions are statistical estimates
            projected from historical data and current trajectories. Predictions are not guaranteed facts and
            indicate areas that <em>may become high-risk if current trends continue</em> without proactive administrative intervention.
          </div>
        </div>

        {/* Prediction Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergingRisks.map((pred) => (
            <div
              key={pred.id}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Emerging Risk Indicator
                  </span>
                  <RiskBadge level={pred.riskLevel} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2">{pred.kpiTitle}</h3>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-3 rounded border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Status:</span>
                    <span className="font-semibold text-slate-800">{pred.currentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Historical Trend:</span>
                    <TrendIndicator trend={pred.historicalTrend} size="sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model Confidence:</span>
                    <span className="font-mono font-semibold text-indigo-700">{pred.confidenceScore}%</span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block">
                      Estimated Future Direction:
                    </span>
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      &ldquo;{pred.estimatedFutureDirection}&rdquo;
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block">
                      Analytical Explanation:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{pred.reason}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-indigo-900 mb-1">
                  Recommended Proactive Intervention:
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">{pred.intervention}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
