import React from 'react';
import { useInstitutional } from '../../context/InstitutionalContext';
import { RiskBadge } from './RiskBadge';
import { TrendIndicator } from './TrendIndicator';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Mail,
  ShieldAlert,
  ClipboardList,
  CheckCircle,
} from 'lucide-react';

export const StudentModal: React.FC = () => {
  const { selectedStudentForModal, setSelectedStudentForModal } = useInstitutional();

  if (!selectedStudentForModal) return null;

  const s = selectedStudentForModal;
  const isHighRisk = s.calculatedRisk === 'HIGH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
              {s.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{s.name}</h2>
              <div className="text-xs text-slate-500 font-mono">
                {s.studentId} • {s.department} • Semester {s.semester}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedStudentForModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Risk Level Banner */}
          <div
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              isHighRisk
                ? 'bg-red-50 border-red-200 text-red-900'
                : s.calculatedRisk === 'MEDIUM'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  Institutional Risk Assessment:
                </span>
                <RiskBadge level={s.calculatedRisk} size="sm" />
              </div>
              <p className="leading-relaxed">{s.riskReason}</p>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Attendance
              </div>
              <div
                className={`text-xl font-bold mt-1 ${
                  s.attendance < 60
                    ? 'text-red-600'
                    : s.attendance < 75
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {s.attendance}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Norm: &ge;75%</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Internal Marks
              </div>
              <div
                className={`text-xl font-bold mt-1 ${
                  s.internalMarks < 40
                    ? 'text-red-600'
                    : s.internalMarks < 50
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {s.internalMarks}/100
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Min pass: 40</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Active Backlogs
              </div>
              <div
                className={`text-xl font-bold mt-1 ${
                  s.backlogs >= 3
                    ? 'text-red-600'
                    : s.backlogs >= 1
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {s.backlogs}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Critical &ge;3</div>
            </div>
          </div>

          {/* Performance & Mentorship Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <span className="text-slate-500">Longitudinal Performance Trend:</span>
              <TrendIndicator trend={s.performanceTrend} size="sm" />
            </div>

            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <span className="text-slate-500">Assigned Faculty Mentor:</span>
              <span className="font-semibold text-slate-800">{s.mentorName}</span>
            </div>

            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <span className="text-slate-500">Institutional Email:</span>
              <span className="font-mono text-slate-700 text-[11px]">{s.email}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                <span>Mentor Progress Notes</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;{s.mentorNotes || 'No special remarks recorded.'}&rdquo;
              </p>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="p-3.5 bg-indigo-50/60 rounded-lg border border-indigo-100 text-xs">
            <div className="font-bold text-indigo-950 mb-1.5">
              Recommended Academic Intervention Protocol:
            </div>
            <ul className="space-y-1 text-slate-700 list-disc list-inside">
              {s.attendance < 75 && (
                <li>Issue official parent attendance shortfall notification.</li>
              )}
              {s.internalMarks < 50 && (
                <li>Enroll in Saturday remedial problem-solving tutorial batches.</li>
              )}
              {s.backlogs > 0 && (
                <li>Assign peer-led study group for supplementary exam clearance.</li>
              )}
              {s.calculatedRisk === 'LOW' && (
                <li>Student on satisfactory track; consider for honors and research internship.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedStudentForModal(null)}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
