import React, { useState, useMemo } from 'react';
import { useInstitutional } from '../context/InstitutionalContext';
import { Department } from '../types/institutional';
import { RiskBadge } from '../components/common/RiskBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Filter,
  Layers,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { calculatePercentageChange } from '../utils/analyticsEngine';

export const AdmissionsView: React.FC = () => {
  const { admissionsData, academicYear } = useInstitutional();

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>(academicYear);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Filtered records
  const currentAdmRecord = useMemo(() => {
    return (
      admissionsData.find(
        (a) => a.academicYear === selectedYear && a.department === selectedDept
      ) || admissionsData.find((a) => a.department === 'ALL')
    );
  }, [admissionsData, selectedYear, selectedDept]);

  // Previous year for YoY comparison
  const prevYearStr = selectedYear === '2025-26' ? '2024-25' : selectedYear === '2024-25' ? '2023-24' : '2022-23';
  const prevAdmRecord = useMemo(() => {
    return admissionsData.find(
      (a) => a.academicYear === prevYearStr && a.department === selectedDept
    );
  }, [admissionsData, prevYearStr, selectedDept]);

  // Calculations
  const applications = currentAdmRecord?.applications || 0;
  const admissions = currentAdmRecord?.admissions || 0;
  const availableSeats = currentAdmRecord?.availableSeats || 0;
  const filledSeats = currentAdmRecord?.filledSeats || 0;
  const conversionRate = currentAdmRecord?.conversionRate || 0;
  const vacancyRate = currentAdmRecord?.vacancyRate || 0;

  const prevAdmissions = prevAdmRecord?.admissions || admissions;
  const yoyChange = calculatePercentageChange(admissions, prevAdmissions);

  // Longitudinal chart data across all academic years for current selected department
  const historicalDeptData = useMemo(() => {
    const years = ['2022-23', '2023-24', '2024-25', '2025-26'];
    return years.map((yr) => {
      const rec = admissionsData.find(
        (a) => a.academicYear === yr && a.department === selectedDept
      );
      return {
        academicYear: yr,
        applications: rec?.applications || 0,
        admissions: rec?.admissions || 0,
        availableSeats: rec?.availableSeats || 0,
        conversionRate: rec?.conversionRate || 0,
        vacancyRate: rec?.vacancyRate || 0,
      };
    });
  }, [admissionsData, selectedDept]);

  // Department breakdown for currently selected academic year
  const departmentBreakdown = useMemo(() => {
    return admissionsData.filter(
      (a) => a.academicYear === selectedYear && a.department !== 'ALL'
    );
  }, [admissionsData, selectedYear]);

  // Admission Risk Detection
  const hasDecliningTrend = yoyChange < -5;
  const isHighVacancy = vacancyRate > 20;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Enrollment Analytics
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-indigo-700">AY {selectedYear}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admissions & Enrollment Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-year application funnel, conversion velocity, seat vacancy, and branch-level demand tracking
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">AY:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments (Institutional)</option>
              <option value="CSE">CSE</option>
              <option value="AIML">AIML</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6 Key Admissions Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Applications</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{applications.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">Total received</span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admissions (Intake)</span>
          <div className="text-xl font-bold text-indigo-700 mt-1">{admissions.toLocaleString()}</div>
          <span className={`text-[10px] font-semibold ${yoyChange < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {yoyChange > 0 ? `+${yoyChange}%` : `${yoyChange}%`} YoY
          </span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sanctioned Seats</span>
          <div className="text-xl font-bold text-slate-800 mt-1">{availableSeats.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">AICTE / Council quota</span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seats Filled</span>
          <div className="text-xl font-bold text-slate-800 mt-1">{filledSeats.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">Enrolled students</span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Conversion Rate</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{conversionRate.toFixed(1)}%</div>
          <span className="text-[10px] text-slate-400">Admissions / Applications</span>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${vacancyRate > 20 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vacancy Rate</span>
          <div className={`text-xl font-bold mt-1 ${vacancyRate > 20 ? 'text-red-700' : 'text-slate-800'}`}>
            {vacancyRate.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500">Unfilled capacity</span>
        </div>
      </div>

      {/* Admission Risk Analysis Section */}
      <section className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-700" />
            <h2 className="text-sm font-bold text-slate-900">Admission Risk Analysis & Early Warning</h2>
          </div>
          <RiskBadge level={isHighVacancy || yoyChange < -15 ? 'HIGH' : hasDecliningTrend ? 'MEDIUM' : 'LOW'} size="sm" />
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
          <p>
            <strong>Intake Trajectory Assessment:</strong>{' '}
            {hasDecliningTrend
              ? `Admissions for ${selectedDept === 'ALL' ? 'the entire institution' : selectedDept} show a contraction of ${Math.abs(yoyChange)}% YoY compared to AY ${prevYearStr}.`
              : `Admissions remain healthy with a YoY variance of ${yoyChange > 0 ? `+${yoyChange}%` : `${yoyChange}%`}.`}
          </p>
          <p>
            <strong>Seat Utilization & Vulnerability:</strong>{' '}
            {vacancyRate > 25
              ? `Critical seat vacancy of ${vacancyRate.toFixed(1)}% detected in ${selectedDept}. High vacancy threatens laboratory unit costs and faculty-student ratio (FSR) benchmarks.`
              : vacancyRate > 5
              ? `Moderate seat vacancy of ${vacancyRate.toFixed(1)}% noted. Traditional engineering streams reflect reduced candidate preference.`
              : 'Near-complete seat saturation achieved with optimal intake conversion.'}
          </p>
          <p className="text-slate-500 italic">
            * Early warning note: If current branch-wise preference disparities persist, Mechanical and Electrical Engineering departments may experience continued vacancy pressures above 40%.
          </p>
        </div>
      </section>

      {/* Visual Charts: 2-Column Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications vs Admissions Longitudinal Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Applications vs Admissions ({selectedDept})
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">4-Year historical intake trend</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalDeptData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="academicYear" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="applications" name="Applications" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="admissions" name="Admissions" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rate vs Vacancy Rate Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Conversion Rate vs Vacancy Rate ({selectedDept})
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Longitudinal percentage efficiency metrics</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalDeptData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="academicYear" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 80]} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="conversionRate" name="Conversion Rate %" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="vacancyRate" name="Vacancy Rate %" stroke="#e11d48" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department-wise Admissions Table for Selected Academic Year */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Department-Wise Admissions Breakdown (AY {selectedYear})
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Comparative intake capacity across all engineering disciplines
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Applications</th>
                <th className="py-2.5 px-3">Admissions</th>
                <th className="py-2.5 px-3">Sanctioned Seats</th>
                <th className="py-2.5 px-3">Filled Seats</th>
                <th className="py-2.5 px-3">Conversion %</th>
                <th className="py-2.5 px-3">Vacancy %</th>
                <th className="py-2.5 px-3">Branch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentBreakdown.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.department}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.applications.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-700">{row.admissions.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.availableSeats.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.filledSeats.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{row.conversionRate.toFixed(1)}%</td>
                  <td className="py-2.5 px-3">
                    <span className={`font-semibold ${row.vacancyRate > 20 ? 'text-red-600' : 'text-emerald-700'}`}>
                      {row.vacancyRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.vacancyRate === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : row.vacancyRate > 30
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {row.vacancyRate === 0 ? 'Full Quota' : row.vacancyRate > 30 ? 'High Vacancy' : 'Normal'}
                    </span>
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
