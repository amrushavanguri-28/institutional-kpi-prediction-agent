import React, { useState } from 'react';
import { useInstitutional } from '../../context/InstitutionalContext';
import {
  Database,
  Calculator,
  Compass,
  ShieldAlert,
  LineChart,
  BrainCircuit,
  Bot,
  BellRing,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const WorkflowBanner: React.FC = () => {
  const { setActiveNavigation } = useInstitutional();
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    {
      id: 'data',
      label: '1. Data',
      subtitle: 'Institutional Datasets',
      icon: Database,
      targetNav: 'Data Management',
      detail: 'Raw admissions, student records, publications, grant records, and faculty workload datasets.',
    },
    {
      id: 'kpi',
      label: '2. Calculation',
      subtitle: 'KPI Metrics Engine',
      icon: Calculator,
      targetNav: 'Dashboard',
      detail: 'Dynamic evaluation of conversion rates, attendance-marks index, and workload completion rates.',
    },
    {
      id: 'situation',
      label: '3. Current State',
      subtitle: 'Situation Analysis',
      icon: Compass,
      targetNav: 'Dashboard',
      detail: 'Automated synthesis of real-time baseline values against institutional benchmark targets.',
    },
    {
      id: 'risk',
      label: '4. Detection',
      subtitle: 'Risk Thresholds',
      icon: ShieldAlert,
      targetNav: 'Academic Risk',
      detail: 'Rule-based and empirical detection of student vulnerability, vacant seats, and funding gaps.',
    },
    {
      id: 'trend',
      label: '5. History',
      subtitle: 'Trend Trajectory',
      icon: LineChart,
      targetNav: 'Dashboard',
      detail: '3 to 5-year longitudinal trend classification: Increasing, Stable, or Declining.',
    },
    {
      id: 'prediction',
      label: '6. Prediction',
      subtitle: 'Emerging Risks',
      icon: BrainCircuit,
      targetNav: 'Dashboard',
      detail: 'Estimates future risk directions if current trend lines continue (with confidence scores).',
    },
    {
      id: 'ai',
      label: '7. AI Agent',
      subtitle: 'Gemini Explanation',
      icon: Bot,
      targetNav: 'AI Assistant',
      detail: 'Generative AI natural language synthesis, root-cause explanations, and management strategies.',
    },
    {
      id: 'alerts',
      label: '8. Alerts',
      subtitle: 'Interventions',
      icon: BellRing,
      targetNav: 'Dashboard',
      detail: 'Targeted warnings dispatched for remedial coaching, outreach restructuring, and grants.',
    },
    {
      id: 'report',
      label: '9. Report',
      subtitle: 'Audit Dossier',
      icon: FileCheck,
      targetNav: 'Reports',
      detail: 'Formal 10-section institutional executive audit report ready for senate and governing council.',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg text-white p-3.5 mb-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Institutional KPI Workflow Pipeline
          </h2>
          <span className="text-[10px] text-slate-400 hidden md:inline">
            • Data to Predictive Intelligence Cycle
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-medium text-indigo-300 hover:text-indigo-200 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Pipeline Details' : 'View Pipeline Architecture'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Horizontal Step Sequence */}
      <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 pt-2 border-t border-slate-800/80">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveNavigation(step.targetNav)}
              className="group text-left p-2 rounded bg-slate-800/50 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-600/60 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
                <span className="text-[9px] font-mono text-slate-400">{idx + 1}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-200 group-hover:text-white leading-tight">
                {step.label}
              </div>
              <div className="text-[9px] text-slate-400 truncate mt-0.5">
                {step.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Architecture Drawer */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {steps.map((step) => (
            <div key={step.id} className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
              <div className="font-semibold text-indigo-300 text-[11px] mb-1">
                {step.label} — {step.subtitle}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
