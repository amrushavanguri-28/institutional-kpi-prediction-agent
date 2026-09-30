import React, { useState, useMemo } from 'react';
import { useInstitutional } from '../context/InstitutionalContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { RiskLevel, StudentRecord } from '../types/institutional';
import { calculateStudentRisk } from '../utils/analyticsEngine';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  AlertOctagon,
  Search,
  Filter,
  User,
  ShieldAlert,
  ArrowUpDown,
  BookOpen,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const AcademicRiskView: React.FC = () => {
  const { studentsData, setSelectedStudentForModal } = useInstitutional();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState<'ALL' | RiskLevel>('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'attendance' | 'marks' | 'backlogs'>('risk');

  // Compute student risk dynamically on the fly
  const dynamicStudents = useMemo(() => {
    return studentsData.map((s) => {
      const riskCalc = calculateStudentRisk(s);
      return {
        ...s,
        calculatedRisk: riskCalc.riskLevel,
        riskReason: riskCalc.reason,
      };
    });
  }, [studentsData]);

  // Filtered & Sorted student list
  const filteredStudents = useMemo(() => {
    return dynamicStudents
      .filter((s) => {
        if (selectedDept !== 'ALL' && s.department !== selectedDept) return false;
        if (selectedRisk !== 'ALL' && s.calculatedRisk !== selectedRisk) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = s.name.toLowerCase().includes(q);
          const matchId = s.studentId.toLowerCase().includes(q);
          const matchDept = s.department.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchDept) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'risk') {
          const rank: Record<RiskLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return rank[b.calculatedRisk] - rank[a.calculatedRisk];
        }
        if (sortBy === 'attendance') return a.attendance - b.attendance; // lowest attendance first
        if (sortBy === 'marks') return a.internalMarks - b.internalMarks; // lowest marks first
        if (sortBy === 'backlogs') return b.backlogs - a.backlogs; // highest backlogs first
        return 0;
      });
  }, [dynamicStudents, selectedDept, selectedRisk, searchTerm, sortBy]);

  // Aggregate stats
  const totalStudents = dynamicStudents.length;
  const highRiskStudents = dynamicStudents.filter((s) => s.calculatedRisk === 'HIGH');
  const medRiskStudents = dynamicStudents.filter((s) => s.calculatedRisk === 'MEDIUM');
  const lowRiskStudents = dynamicStudents.filter((s) => s.calculatedRisk === 'LOW');

  // Chart 1: Risk Level Distribution Data
  const riskDistributionData = [
    { name: 'High Risk', count: highRiskStudents.length, color: '#e11d48' },
    { name: 'Medium Risk', count: medRiskStudents.length, color: '#f59e0b' },
    { name: 'Low Risk', count: lowRiskStudents.length, color: '#10b981' },
  ];

  // Chart 2: Department-wise Risk Breakdown
  const deptRiskData = useMemo(() => {
    const depts = ['CSE', 'AIML', 'ECE', 'EEE', 'MECH'];
    return depts.map((d) => {
      const deptStuds = dynamicStudents.filter((s) => s.department === d);
      return {
        department: d,
        highRisk: deptStuds.filter((s) => s.calculatedRisk === 'HIGH').length,
        medRisk: deptStuds.filter((s) => s.calculatedRisk === 'MEDIUM').length,
        lowRisk: deptStuds.filter((s) => s.calculatedRisk === 'LOW').length,
      };
    });
  }, [dynamicStudents]);

  // Chart 3: Attendance Cohort Distribution
  const attendanceCohortData = useMemo(() => {
    return [
      { cohort: '<60% (Critical)', count: dynamicStudents.filter((s) => s.attendance < 60).length },
      { cohort: '60–74% (Borderline)', count: dynamicStudents.filter((s) => s.attendance >= 60 && s.attendance < 75).length },
      { cohort: '75–84% (Adequate)', count: dynamicStudents.filter((s) => s.attendance >= 75 && s.attendance < 85).length },
      { cohort: '85–100% (High)', count: dynamicStudents.filter((s) => s.attendance >= 85).length },
    ];
  }, [dynamicStudents]);

  // Chart 4: Backlogs Cohort Distribution
  const backlogCohortData = useMemo(() => {
    return [
      { backlogCategory: '0 Backlogs', count: dynamicStudents.filter((s) => s.backlogs === 0).length },
      { backlogCategory: '1-2 Backlogs', count: dynamicStudents.filter((s) => s.backlogs === 1 || s.backlogs === 2).length },
      { backlogCategory: '3+ Backlogs (Critical)', count: dynamicStudents.filter((s) => s.backlogs >= 3).length },
    ];
  }, [dynamicStudents]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
              Early Warning Indicator
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-600">{totalStudents} Active Cohort Records</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Academic Risk Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic risk detection based on attendance thresholds, internal examination marks, and active backlogs
          </p>
        </div>

        {/* Aggregate KPI counters */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-md text-center">
            <div className="text-[10px] uppercase font-bold text-red-700">High Risk</div>
            <div className="text-lg font-bold text-red-800">{highRiskStudents.length}</div>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md text-center">
            <div className="text-[10px] uppercase font-bold text-amber-700">Medium Risk</div>
            <div className="text-lg font-bold text-amber-800">{medRiskStudents.length}</div>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Satisfactory</div>
            <div className="text-lg font-bold text-emerald-800">{lowRiskStudents.length}</div>
          </div>
        </div>
      </div>

      {/* Dynamic Risk Formula Legend Banner */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-700 shrink-0" />
          <div>
            <strong className="text-slate-900 font-semibold">Active Algorithmic Risk Logic:</strong>
            <span className="text-slate-600 ml-1">
              Evaluated in real-time from raw student records (Never hard-coded).
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono font-medium">
            HIGH: Attendance &lt; 60% || Marks &lt; 40 || Backlogs &ge; 3
          </span>
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-medium">
            MED: Attendance &lt; 75% || Marks &lt; 50 || Backlogs 1-2
          </span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-medium">
            LOW: Normal
          </span>
        </div>
      </div>

      {/* Four Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chart 1: Students by Risk Level */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Cohort Risk Distribution
          </h3>
          <p className="text-[10px] text-slate-400 mb-2">Total {totalStudents} students evaluated</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={55}
                  innerRadius={28}
                  label={({ percent }) => (percent ? `${(percent * 100).toFixed(0)}%` : '')}
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department-wise Risk */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Department-Wise Risk
          </h3>
          <p className="text-[10px] text-slate-400 mb-2">High vs Med risk counts</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptRiskData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                <Bar dataKey="highRisk" name="High Risk" fill="#e11d48" stackId="a" radius={[2, 2, 0, 0]} />
                <Bar dataKey="medRisk" name="Med Risk" fill="#f59e0b" stackId="a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Attendance Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Attendance Segments
          </h3>
          <p className="text-[10px] text-slate-400 mb-2">Compliance threshold (&ge;75%)</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceCohortData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <YAxis dataKey="cohort" type="category" tick={{ fontSize: 9, fill: '#64748b' }} width={75} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                <Bar dataKey="count" name="Students" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Backlog Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Backlog Distribution
          </h3>
          <p className="text-[10px] text-slate-400 mb-2">Subject clearance backlog burden</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={backlogCohortData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="backlogCategory" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                <Bar dataKey="count" name="Students" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Student Registry Table & Filters */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Student Academic Risk Registry
            </h2>
            <p className="text-xs text-slate-500">
              Click any student row to view personalized mentor notes, attendance trajectory, and intervention steps
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredStudents.length} of {totalStudents} students
          </div>
        </div>

        {/* Table Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, ID..."
              className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="AIML">AIML</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value as any)}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk Only</option>
            <option value="LOW">Low Risk Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="risk">Sort by Risk Priority</option>
            <option value="attendance">Sort by Lowest Attendance</option>
            <option value="marks">Sort by Lowest Internal Marks</option>
            <option value="backlogs">Sort by Highest Backlogs</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Dept</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Internal Marks</th>
                <th className="py-2.5 px-3">Backlogs</th>
                <th className="py-2.5 px-3">Performance Trend</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Risk Reason</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No student records match the active criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStudentForModal(s)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {s.studentId}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 group-hover:text-indigo-900">
                      {s.name}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">
                      {s.department} (Sem {s.semester})
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          s.attendance < 60
                            ? 'text-red-600 font-bold'
                            : s.attendance < 75
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {s.attendance}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          s.internalMarks < 40
                            ? 'text-red-600 font-bold'
                            : s.internalMarks < 50
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {s.internalMarks}/100
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          s.backlogs >= 3
                            ? 'text-red-600 font-bold'
                            : s.backlogs > 0
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {s.backlogs}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <TrendIndicator trend={s.performanceTrend} size="sm" />
                    </td>
                    <td className="py-2.5 px-3">
                      <RiskBadge level={s.calculatedRisk} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={s.riskReason}>
                      {s.riskReason}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentForModal(s);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] inline-flex items-center gap-0.5"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
