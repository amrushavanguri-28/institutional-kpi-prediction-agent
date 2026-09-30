import React, { useState, useMemo } from 'react';
import { useInstitutional } from '../context/InstitutionalContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import {
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
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink,
  Info,
} from 'lucide-react';
import { calculateFacultyRisk } from '../utils/analyticsEngine';

export const FacultyWorkView: React.FC = () => {
  const { facultyWorkData, setSelectedFacultyName, academicYear } = useInstitutional();

  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Aggregates
  const totalAssigned = useMemo(() => {
    return facultyWorkData.reduce((acc, f) => acc + f.assignedTasks, 0);
  }, [facultyWorkData]);

  const totalCompleted = useMemo(() => {
    return facultyWorkData.reduce((acc, f) => acc + f.completedTasks, 0);
  }, [facultyWorkData]);

  const totalPending = useMemo(() => {
    return facultyWorkData.reduce((acc, f) => acc + f.pendingTasks, 0);
  }, [facultyWorkData]);

  const totalOverdue = useMemo(() => {
    return facultyWorkData.reduce((acc, f) => acc + f.overdueTasks, 0);
  }, [facultyWorkData]);

  const institutionalCompletionRate = useMemo(() => {
    return totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 84.6;
  }, [totalAssigned, totalCompleted]);

  // Dynamic evaluation of faculty risk
  const enrichedFaculty = useMemo(() => {
    return facultyWorkData.map((f) => {
      const rate = f.assignedTasks > 0 ? (f.completedTasks / f.assignedTasks) * 100 : 0;
      const { riskLevel, status } = calculateFacultyRisk(rate);
      return {
        ...f,
        calculatedRate: Math.round(rate * 10) / 10,
        riskLevel,
        dynamicStatus: status,
      };
    });
  }, [facultyWorkData]);

  // Filtered faculty
  const filteredFaculty = useMemo(() => {
    return enrichedFaculty.filter((f) => {
      if (deptFilter !== 'ALL' && f.department !== deptFilter) return false;
      if (riskFilter !== 'ALL' && f.riskLevel !== riskFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = f.facultyName.toLowerCase().includes(q);
        const matchDept = f.department.toLowerCase().includes(q);
        if (!matchName && !matchDept) return false;
      }
      return true;
    });
  }, [enrichedFaculty, deptFilter, riskFilter, searchTerm]);

  // Department-wise completion rates for chart
  const deptWorkData = useMemo(() => {
    const depts = ['CSE', 'AIML', 'ECE', 'EEE', 'MECH'];
    return depts.map((d) => {
      const recs = enrichedFaculty.filter((f) => f.department === d);
      const assigned = recs.reduce((acc, f) => acc + f.assignedTasks, 0);
      const completed = recs.reduce((acc, f) => acc + f.completedTasks, 0);
      const overdue = recs.reduce((acc, f) => acc + f.overdueTasks, 0);
      const rate = assigned > 0 ? Math.round((completed / assigned) * 1000) / 10 : 0;
      return {
        department: d,
        completionRate: rate,
        overdueCount: overdue,
      };
    });
  }, [enrichedFaculty]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Institutional Operations & Milestones
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-indigo-700">AY {academicYear} Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Faculty Work Completion
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring task delivery across syllabus coverage, internal exam evaluation, OBE course outcomes, and committee compliance
          </p>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Milestones</div>
            <div className="text-base font-bold text-slate-900">{totalAssigned}</div>
          </div>
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Completed</div>
            <div className="text-base font-bold text-emerald-700">{totalCompleted}</div>
          </div>
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Overdue Tasks</div>
            <div className="text-base font-bold text-red-600">{totalOverdue}</div>
          </div>
          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-md text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-indigo-800">Completion Rate</div>
            <div className="text-base font-bold text-indigo-900">
              {institutionalCompletionRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Policy Note */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong>Operational Monitoring Context:</strong> Completion rates track workflow progress across administrative
          deadlines (Continuous Internal Assessment uploads, NBA course files, attendance reconciliation). In accordance with institutional
          governance, this metric serves as a operational process tracking tool rather than an individual qualitative appraisal.
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise completion rates */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Department-Wise Milestone Completion Rate (%)
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Benchmark norm: &ge;90% timely completion</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptWorkData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[60, 100]} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="completionRate" name="Completion Rate %" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Overdue Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Department Overdue Milestones
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Tasks requiring immediate HOD follow-up</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptWorkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="overdueCount" name="Overdue Tasks" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Faculty Work Table */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Faculty Workload & Milestone Table
            </h2>
            <p className="text-xs text-slate-500">
              Click any faculty member to review their individual task and research dossier
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Showing {filteredFaculty.length} of {facultyWorkData.length} faculty records
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search faculty name..."
              className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="AIML">AIML</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Workload Risk Levels</option>
            <option value="HIGH">High Risk (&lt;80% Completion)</option>
            <option value="MEDIUM">Medium Risk (80–90%)</option>
            <option value="LOW">Low Risk (&gt;90%)</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Faculty Member</th>
                <th className="py-2.5 px-3">Dept</th>
                <th className="py-2.5 px-3">Designation</th>
                <th className="py-2.5 px-3">Assigned</th>
                <th className="py-2.5 px-3">Completed</th>
                <th className="py-2.5 px-3">Pending</th>
                <th className="py-2.5 px-3">Overdue</th>
                <th className="py-2.5 px-3">Completion %</th>
                <th className="py-2.5 px-3">Work Status</th>
                <th className="py-2.5 px-3 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaculty.map((fac) => (
                <tr
                  key={fac.id}
                  onClick={() => setSelectedFacultyName(fac.facultyName)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 group-hover:text-indigo-900">
                    {fac.facultyName}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-600">{fac.department}</td>
                  <td className="py-2.5 px-3 text-slate-500">{fac.designation}</td>
                  <td className="py-2.5 px-3 text-slate-700">{fac.assignedTasks}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">{fac.completedTasks}</td>
                  <td className="py-2.5 px-3 text-amber-600 font-medium">{fac.pendingTasks}</td>
                  <td className="py-2.5 px-3">
                    <span className={`font-semibold ${fac.overdueTasks > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                      {fac.overdueTasks}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-bold ${
                        fac.calculatedRate < 80
                          ? 'text-red-600'
                          : fac.calculatedRate <= 90
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {fac.calculatedRate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <RiskBadge level={fac.riskLevel} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFacultyName(fac.facultyName);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] inline-flex items-center gap-0.5"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
