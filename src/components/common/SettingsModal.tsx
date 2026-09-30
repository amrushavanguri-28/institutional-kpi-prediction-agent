import React from 'react';
import { useInstitutional } from '../../context/InstitutionalContext';
import {
  X,
  RotateCcw,
  Sliders,
  CheckCircle,
  Database,
  Cpu,
  Shield,
  Building,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    academicYear,
    setAcademicYear,
    resetToDefaultData,
  } = useInstitutional();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Institutional System Settings</h2>
              <div className="text-[11px] text-slate-500">Configuration and threshold parameters</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Institutional Metadata */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-600" />
              <span>Institution Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Institution:</span>
                <span className="font-semibold text-slate-800">Institute of Technology & Science</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Affiliation:</span>
                <span className="font-semibold text-slate-800">Autonomous / NAAC A++ Grade</span>
              </div>
            </div>
          </div>

          {/* Academic Year Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">Default Academic Year</label>
            <p className="text-[11px] text-slate-500">
              Select the active benchmark cycle for institutional KPI calculations.
            </p>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="2025-26">AY 2025-26 (Current Academic Year)</option>
              <option value="2024-25">AY 2024-25 (Previous Period)</option>
              <option value="2023-24">AY 2023-24 (Baseline 2)</option>
              <option value="2022-23">AY 2022-23 (Baseline 1)</option>
            </select>
          </div>

          {/* Early Warning Risk Rules Display */}
          <div className="space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-700" />
              <span>Calibrated Early Warning Rules</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
              <div>
                <strong className="text-red-700">High Academic Risk:</strong> Attendance &lt; 60% OR Internal Marks &lt; 40 OR Active Backlogs &ge; 3
              </div>
              <div>
                <strong className="text-amber-700">Medium Academic Risk:</strong> Attendance &lt; 75% OR Internal Marks &lt; 50 OR Backlogs 1–2
              </div>
              <div>
                <strong className="text-red-700">Faculty Task Risk:</strong> Completion Rate &lt; 80% (Critical Delay)
              </div>
              <div>
                <strong className="text-indigo-700">Funding Risk:</strong> Negative YoY change exceeding -10%
              </div>
            </div>
          </div>

          {/* AI Model Engine Status */}
          <div className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-700" />
              <div>
                <div className="font-bold text-indigo-950">AI Analysis Engine</div>
                <div className="text-[10px] text-indigo-700">Google Gemini 3.8 Flash • Server Proxy Active</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              CONNECTED
            </span>
          </div>

          {/* Sample Data Reset */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Reset Institutional Sample Data</div>
                <div className="text-[11px] text-slate-500">
                  Restore default 4-year institutional benchmark datasets.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset all institutional tables to default sample data? Any manual edits will be reverted.')) {
                    resetToDefaultData();
                    setIsSettingsOpen(false);
                  }
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
