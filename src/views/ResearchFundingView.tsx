import React, { useState, useMemo } from 'react';
import { useInstitutional } from '../context/InstitutionalContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { formatINR, calculatePercentageChange } from '../utils/analyticsEngine';
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
  BadgeIndianRupee,
  ShieldAlert,
  Building,
  TrendingDown,
  TrendingUp,
  FileCheck2,
  Filter,
  Search,
} from 'lucide-react';

export const ResearchFundingView: React.FC = () => {
  const { fundingData, academicYear } = useInstitutional();

  const [selectedYear, setSelectedYear] = useState<string>(academicYear);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [agencyFilter, setAgencyFilter] = useState<string>('ALL');

  // Filter current year grants
  const currentGrants = useMemo(() => {
    return fundingData.filter((g) => g.academicYear === selectedYear);
  }, [fundingData, selectedYear]);

  // Filter previous year grants
  const prevYearStr = selectedYear === '2025-26' ? '2024-25' : selectedYear === '2024-25' ? '2023-24' : '2022-23';
  const prevGrants = useMemo(() => {
    return fundingData.filter((g) => g.academicYear === prevYearStr);
  }, [fundingData, prevYearStr]);

  // Total funding
  const currentTotal = useMemo(() => {
    return currentGrants.reduce((acc, g) => acc + g.amountInr, 0);
  }, [currentGrants]);

  const prevTotal = useMemo(() => {
    return prevGrants.reduce((acc, g) => acc + g.amountInr, 0);
  }, [prevGrants]);

  const fundingChange = calculatePercentageChange(currentTotal, prevTotal);
  const isDeclining = fundingChange < -3;
  const isIncreasing = fundingChange > 3;
  const fundingTrend = isIncreasing ? 'Increasing' : isDeclining ? 'Declining' : 'Stable';

  // Longitudinal annual grant trend
  const historicalTrendData = useMemo(() => {
    const years = ['2022-23', '2023-24', '2024-25', '2025-26'];
    return years.map((yr) => {
      const yearGrants = fundingData.filter((g) => g.academicYear === yr);
      const total = yearGrants.reduce((acc, g) => acc + g.amountInr, 0);
      return {
        academicYear: yr,
        totalInr: total,
        totalInCr: Math.round((total / 10000000) * 100) / 100,
        grantsCount: yearGrants.length,
      };
    });
  }, [fundingData]);

  // Department-wise funding breakdown for current selected academic year
  const deptFundingData = useMemo(() => {
    const depts = ['CSE', 'AIML', 'ECE', 'EEE', 'MECH'];
    return depts.map((d) => {
      const curr = currentGrants
        .filter((g) => g.department === d)
        .reduce((acc, g) => acc + g.amountInr, 0);
      const prev = prevGrants
        .filter((g) => g.department === d)
        .reduce((acc, g) => acc + g.amountInr, 0);
      return {
        department: d,
        currentInLakhs: Math.round(curr / 100000),
        previousInLakhs: Math.round(prev / 100000),
        currentInr: curr,
        previousInr: prev,
      };
    });
  }, [currentGrants, prevGrants]);

  // Filtered grants table
  const tableGrants = useMemo(() => {
    return currentGrants.filter((g) => {
      if (selectedDept !== 'ALL' && g.department !== selectedDept) return false;
      if (agencyFilter !== 'ALL' && g.fundingAgency !== agencyFilter) return false;
      return true;
    });
  }, [currentGrants, selectedDept, agencyFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sponsored Research & Grants
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-indigo-700">AY {selectedYear} Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Research Funding Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Extramural sponsored research, central agency grants (DST, SERB, AICTE, DRDO, ISRO), and industry capital
          </p>
        </div>

        {/* Academic Year Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Academic Year:</span>
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
      </div>

      {/* Primary Funding Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sanctioned Funding</span>
          <div className="text-xl sm:text-2xl font-bold text-indigo-950 mt-1">
            {formatINR(currentTotal, true)}
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {formatINR(currentTotal, false)}
          </span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Previous Period Funding</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-700 mt-1">
            {formatINR(prevTotal, true)}
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            AY {prevYearStr} Baseline
          </span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">YoY Financial Variance</span>
          <div className={`text-xl sm:text-2xl font-bold mt-1 ${fundingChange < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {fundingChange > 0 ? `+${fundingChange}%` : `${fundingChange}%`}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <TrendIndicator trend={fundingTrend} size="sm" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Funding Risk Rating</span>
          <div className="mt-2">
            <RiskBadge level={fundingChange < -10 ? 'HIGH' : fundingChange < -3 ? 'MEDIUM' : 'LOW'} size="md" />
          </div>
          <span className="text-[10px] text-slate-500 block mt-2">
            Based on 3-year extramural renewal pipeline
          </span>
        </div>
      </div>

      {/* Dedicated Section: Funding Risk Analysis */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-700" />
            <h2 className="text-sm font-bold text-slate-900">Funding Risk Analysis & Pipeline Assessment</h2>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
            isDeclining ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            Institutional Status: {fundingTrend}
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
          <p>
            <strong>Trajectory Analysis:</strong>{' '}
            {isDeclining ? (
              <>
                External research funding has contracted by{' '}
                <strong className="text-red-700">{Math.abs(fundingChange)}% YoY</strong> (from {formatINR(prevTotal, true)} down to {formatINR(currentTotal, true)}). Over the 4-year longitudinal period, funding expanded from ₹5.4 Cr (AY 22-23) to a peak of ₹5.7 Cr (AY 23-24), before contracting in the current cycle.
              </>
            ) : (
              <>Research funding demonstrates upward traction, growing at {fundingChange}% YoY.</>
            )}
          </p>

          <p>
            <strong>Root Cause of Current Variance:</strong> Multi-year DRDO and AICTE RPS grants in the Mechanical and Electrical departments reached completion this cycle without adequate active proposal submissions to replace them. In contrast, Computer Science and AIML have maintained stable funding inflows through new SERB and DST awards.
          </p>

          <div className="pt-2 border-t border-slate-200 text-indigo-900 font-medium">
            <strong>Recommended Governance Intervention:</strong> Institutional Research Board must release ₹25 Lakhs in internal seed grants to subsidize preliminary prototyping for upcoming SERB Core Research Grant (CRG) and DST International Bilateral calls before Q3.
          </div>
        </div>
      </section>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Funding Trend (4 Years) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Historical Funding Trend (INR Crores)
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Multi-year sanctioned research capital trajectory</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="academicYear" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" Cr" domain={[4, 6.5]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val) => [`₹${val} Crore`, 'Total Sanctioned']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="totalInCr"
                  name="Sanctioned Grants (₹ Cr)"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Funding Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Department-Wise Funding (in ₹ Lakhs)
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Current vs Previous Year Comparison</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptFundingData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" L" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val, name) => [`₹${val} Lakhs`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="previousInLakhs" name="AY Prev (Lakhs)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="currentInLakhs" name="AY Current (Lakhs)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table: Sponsored Research Projects */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Sanctioned Research Grants Dossier (AY {selectedYear})
            </h2>
            <p className="text-xs text-slate-500">
              Approved research projects funded by central agencies and corporate R&D
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="AIML">AIML</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
            </select>

            <select
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
            >
              <option value="ALL">All Agencies</option>
              <option value="SERB">SERB</option>
              <option value="DST">DST</option>
              <option value="ISRO">ISRO</option>
              <option value="AICTE">AICTE</option>
              <option value="DRDO">DRDO</option>
              <option value="Industry">Industry</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Project Title</th>
                <th className="py-2.5 px-3">Funding Agency</th>
                <th className="py-2.5 px-3">Dept</th>
                <th className="py-2.5 px-3">Principal Investigator</th>
                <th className="py-2.5 px-3">Amount (INR)</th>
                <th className="py-2.5 px-3">Sanction Year</th>
                <th className="py-2.5 px-3">Disbursement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableGrants.map((grant) => (
                <tr key={grant.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-sm">
                    {grant.grantTitle}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {grant.fundingAgency}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{grant.department}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-medium">{grant.principalInvestigator}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {formatINR(grant.amountInr, true)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono">{grant.sanctionYear}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {grant.status}
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
