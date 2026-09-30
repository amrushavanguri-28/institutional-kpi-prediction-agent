import React from 'react';
import { useInstitutional } from '../../context/InstitutionalContext';
import { TrendIndicator } from './TrendIndicator';
import {
  X,
  User,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

export const FacultyModal: React.FC = () => {
  const {
    selectedFacultyName,
    setSelectedFacultyName,
    facultyWorkData,
    publicationsData,
  } = useInstitutional();

  if (!selectedFacultyName) return null;

  const workRecord = facultyWorkData.find((f) => f.facultyName === selectedFacultyName);
  const pubRecord = publicationsData.find((p) => p.facultyName === selectedFacultyName);

  if (!workRecord && !pubRecord) return null;

  const department = workRecord?.department || pubRecord?.department || 'CSE';
  const designation = workRecord?.designation || 'Faculty Member';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
              {selectedFacultyName
                .replace('Dr. ', '')
                .replace('Prof. ', '')
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{selectedFacultyName}</h2>
              <div className="text-xs text-slate-500 font-mono">
                {department} • {designation}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFacultyName(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Section 1: Work Completion Performance */}
          {workRecord && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                  Academic & Administrative Workload
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    workRecord.completionRate < 80
                      ? 'bg-red-100 text-red-800'
                      : workRecord.completionRate <= 90
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {workRecord.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center mb-3">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Assigned</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5">{workRecord.assignedTasks}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Completed</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">{workRecord.completedTasks}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Pending</div>
                  <div className="text-base font-bold text-amber-600 mt-0.5">{workRecord.pendingTasks}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Overdue</div>
                  <div className={`text-base font-bold mt-0.5 ${workRecord.overdueTasks > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                    {workRecord.overdueTasks}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Overall Milestone Completion:</span>
                  <span className="font-bold text-slate-800">{workRecord.completionRate}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      workRecord.completionRate < 80 ? 'bg-red-500' : workRecord.completionRate <= 90 ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(workRecord.completionRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Research & Publications Profile */}
          {pubRecord && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                  Research & Publication Output
                </span>
                <TrendIndicator trend={pubRecord.trend} changePercent={pubRecord.changePercent} size="sm" />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center mb-3">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Current AY</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{pubRecord.currentYearPubs}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Prev AY</div>
                  <div className="text-base font-bold text-slate-600 mt-0.5">{pubRecord.previousYearPubs}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Scopus</div>
                  <div className="text-base font-bold text-indigo-700 mt-0.5">{pubRecord.scopusCount}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Citations</div>
                  <div className="text-base font-bold text-indigo-700 mt-0.5">{pubRecord.citations}</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                <strong>Publication Audit Note:</strong> Active contributor to indexed journals ({pubRecord.sciCount} SCI / {pubRecord.scopusCount} Scopus). This indicator is monitored as a developmental and institutional ranking metric, not an evaluative judgment.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedFacultyName(null)}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
