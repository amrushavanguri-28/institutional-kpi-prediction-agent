import React, { useState, useMemo } from 'react';
import { useInstitutional } from '../context/InstitutionalContext';
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
  BookOpen,
  TrendingDown,
  TrendingUp,
  Award,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { calculatePercentageChange } from '../utils/analyticsEngine';

export const FacultyPublicationsView: React.FC = () => {
  const { publicationsData, setSelectedFacultyName, academicYear } = useInstitutional();

  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Aggregates
  const totalCurrentPubs = useMemo(() => {
    return publicationsData.reduce((acc, p) => acc + p.currentYearPubs, 0);
  }, [publicationsData]);

  const totalPrevPubs = useMemo(() => {
    return publicationsData.reduce((acc, p) => acc + p.previousYearPubs, 0);
  }, [publicationsData]);

  const yoyPubChange = calculatePercentageChange(totalCurrentPubs, totalPrevPubs);

  const totalCitations = useMemo(() => {
    return publicationsData.reduce((acc, p) => acc + p.citations, 0);
  }, [publicationsData]);

  const totalScopus = useMemo(() => {
    return publicationsData.reduce((acc, p) => acc + p.scopusCount, 0);
  }, [publicationsData]);

  // Department-wise publication distribution
  const deptData = useMemo(() => {
    const depts = ['CSE', 'AIML', 'ECE', 'EEE', 'MECH'];
    return depts.map((d) => {
      const records = publicationsData.filter((p) => p.department === d);
      return {
        department: d,
        currentYear: records.reduce((acc, p) => acc + p.currentYearPubs, 0),
        previousYear: records.reduce((acc, p) => acc + p.previousYearPubs, 0),
        citations: records.reduce((acc, p) => acc + p.citations, 0),
      };
    });
  }, [publicationsData]);

  // Filtered faculty table
  const filteredFaculty = useMemo(() => {
    return publicationsData.filter((f) => {
      if (deptFilter !== 'ALL' && f.department !== deptFilter) return false;
      if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = f.facultyName.toLowerCase().includes(q);
        const matchDept = f.department.toLowerCase().includes(q);
        if (!matchName && !matchDept) return false;
      }
      return true;
    });
  }, [publicationsData, deptFilter, statusFilter, searchTerm]);

  // Declining faculty count
  const decliningFaculty = publicationsData.filter((p) => p.trend === 'Declining');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Scholarship & Research Productivity
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-emerald-700">AY {academicYear} Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Faculty Publication Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Longitudinal research tracking across Scopus, SCI, Web of Science indexed journals and peer-reviewed conferences
          </p>
        </div>

        {/* Aggregates Pill Group */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Articles</div>
            <div className="text-base font-bold text-slate-900">{totalCurrentPubs}</div>
          </div>
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Scopus Indexed</div>
            <div className="text-base font-bold text-indigo-700">{totalScopus}</div>
          </div>
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Citations</div>
            <div className="text-base font-bold text-emerald-700">{totalCitations}</div>
          </div>
        </div>
      </div>

      {/* Institutional Context / Anti-bias Monitoring Note */}
      <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950 leading-relaxed">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong>Developmental Monitoring Policy:</strong> Faculty publication metrics are evaluated to
          support institutional accreditation (NIRF, NAAC Criteria 3, ABET) and to allocate seed grant funding.
          Declining counts are treated purely as a developmental monitoring indicator to provide research assistance,
          never as an evaluative judgment against individual faculty excellence.
        </div>
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Publications */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Department-Wise Publications (Current vs Previous)
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Comparison across academic disciplines</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="previousYear" name="Prev Academic Year" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="currentYear" name="Current Academic Year" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Citations Trajectory across Departments */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Department Citation Impact
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Cumulative research impact and citations footprint</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="department" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={45} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="citations" name="Cumulative Citations" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Faculty Table & Filters */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Faculty-Wise Research Publication Table
            </h2>
            <p className="text-xs text-slate-500">
              Longitudinal tracking of individual faculty scholarship and peer-reviewed activity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {decliningFaculty.length} of {publicationsData.length} faculty showing recent decline
            </span>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Activity Statuses</option>
            <option value="Exceeding Target">Exceeding Target</option>
            <option value="Active">Active</option>
            <option value="Low Activity">Low Activity (Requires Support)</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Faculty Member</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Current AY Pubs</th>
                <th className="py-2.5 px-3">Previous AY Pubs</th>
                <th className="py-2.5 px-3">YoY Variance</th>
                <th className="py-2.5 px-3">Trend</th>
                <th className="py-2.5 px-3">Scopus / SCI</th>
                <th className="py-2.5 px-3">Monitoring Status</th>
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
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{fac.currentYearPubs}</td>
                  <td className="py-2.5 px-3 text-slate-500">{fac.previousYearPubs}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        fac.changePercent < 0
                          ? 'text-rose-600'
                          : fac.changePercent > 0
                          ? 'text-emerald-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {fac.changePercent > 0 ? `+${fac.changePercent.toFixed(1)}%` : `${fac.changePercent.toFixed(1)}%`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <TrendIndicator trend={fac.trend} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {fac.scopusCount} Scopus / {fac.sciCount} SCI
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fac.status === 'Exceeding Target'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fac.status === 'Low Activity'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {fac.status}
                    </span>
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
