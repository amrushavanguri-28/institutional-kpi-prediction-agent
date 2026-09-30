import React, { useState } from 'react';
import { useInstitutional } from '../context/InstitutionalContext';
import { formatINR } from '../utils/analyticsEngine';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  FileText,
  Printer,
  Download,
  Sparkles,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    calculatedKpis,
    currentSituationNarrative,
    emergingRisks,
    studentsData,
    admissionsData,
    publicationsData,
    fundingData,
    facultyWorkData,
    academicYear,
  } = useInstitutional();

  const [isGenerating, setIsGenerating] = useState(false);
  const [reportDate, setReportDate] = useState(() => new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }));

  // Aggregated data for report
  const highRiskStudents = studentsData.filter((s) => s.calculatedRisk === 'HIGH');
  const currentAdm = admissionsData.find((a) => a.academicYear === academicYear && a.department === 'ALL');
  const totalFunding = fundingData
    .filter((f) => f.academicYear === academicYear)
    .reduce((acc, f) => acc + f.amountInr, 0);
  const totalPubs = publicationsData.reduce((acc, p) => acc + p.currentYearPubs, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const reportText = `
================================================================================
INSTITUTIONAL PERFORMANCE & KPI PREDICTION AUDIT REPORT
Academic Year: ${academicYear} | Date of Generation: ${reportDate}
Institution: Institute of Technology & Science (Autonomous)
================================================================================

1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
This formal institutional dossier provides an early warning evaluation of university Key
Performance Indicators (KPIs) for Academic Year ${academicYear}. Based on continuous
data monitoring, the institution maintains strengths in computing discipline admissions
and faculty publication velocity. However, critical risk flags exist in traditional branch
enrollment contraction, 42 identified students under high academic risk, and a -11.82% YoY
drop in extramural research funding.

2. CURRENT INSTITUTIONAL SITUATION
--------------------------------------------------------------------------------
${currentSituationNarrative.map((n, i) => `${i + 1}. ${n}`).join('\n')}

3. ADMISSIONS ANALYSIS
--------------------------------------------------------------------------------
- Total Applications: ${currentAdm?.applications.toLocaleString()}
- Total Enrolled Admissions: ${currentAdm?.admissions.toLocaleString()}
- Seat Vacancy Rate: ${currentAdm?.vacancyRate.toFixed(1)}%
- Conversion Rate: ${currentAdm?.conversionRate.toFixed(1)}%
- Observation: High seat demand in CSE and AIML (0% vacancy) contrasts with elevated
  vacancy in MECH (49.2%) and EEE (45.8%).

4. STUDENT ACADEMIC RISK ANALYSIS
--------------------------------------------------------------------------------
- Cohort Evaluated: ${studentsData.length} records
- High Risk Category: ${highRiskStudents.length} students
- Primary Indicators: Attendance below 60%, internal exam marks below 40%, and multiple backlogs.
- Action: Mandatory academic mentor counseling and supplementary tutorials scheduled.

5. FACULTY PUBLICATIONS
--------------------------------------------------------------------------------
- Current AY Indexed Publications: ${totalPubs} papers
- Indexed Venues: Scopus, SCI, Web of Science
- Monitoring Classification: Active & Satisfactory. Computing departments exceed baseline targets.

6. RESEARCH FUNDING
--------------------------------------------------------------------------------
- Current Sanctioned Extramural Capital: ${formatINR(totalFunding, false)}
- Central Funding Agencies: SERB, DST, ISRO, AICTE, DRDO
- Variance YoY: Contracted due to natural completion of major legacy defense grants.

7. FACULTY WORK COMPLETION
--------------------------------------------------------------------------------
- Task Milestones Completed: 84.6% timely completion
- Overdue Tasks: Concentrated in continuous internal assessment and laboratory audit files.

8. HISTORICAL TRENDS (4-YEAR LONGITUDINAL)
--------------------------------------------------------------------------------
- Admissions: Declining (3,950 → 3,880 → 3,700 → 3,300)
- High Academic Risk Cohort: Increasing (31 → 37 → 37 → 42)
- Publications: Stable (188 → 196 → 192 → 184)
- Sponsored Research Funding: Contraction (₹5.4 Cr → ₹5.7 Cr → ₹5.5 Cr → ₹4.85 Cr)

9. EMERGING RISKS & PROBABILISTIC FORECAST
--------------------------------------------------------------------------------
${emergingRisks.map((r) => `* [${r.riskLevel}] ${r.kpiTitle}: ${r.estimatedFutureDirection} (Confidence: ${r.confidenceScore}%)`).join('\n')}

10. KEY GOVERNANCE OBSERVATIONS & INTERVENTIONS
--------------------------------------------------------------------------------
1. Institutional Seed Fund: Allocate ₹25 Lakhs to sponsor multi-disciplinary proposal prototyping.
2. Academic Intervention: Issue formal parent alerts and mandatory bridge classes for high-risk students.
3. Curriculum Re-alignment: Integrate Industry 4.0 IoT electives into Mechanical and Electrical syllabi to stabilize enrollment.

Report signed and submitted to Academic Senate and Governing Council.
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Institutional_KPI_Report_AY_${academicYear}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Actions (Hidden on Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Institutional Documentation
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-indigo-700">Audit Dossier</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional KPI Audit Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official 10-section executive dossier prepared for Academic Senate and Board of Governors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Report</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Formal Printable Document Layout */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto text-slate-900 space-y-8 font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Official Institutional Assessment
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                INSTITUTIONAL PERFORMANCE & KPI PREDICTION AUDIT
              </h2>
              <div className="text-xs text-slate-600 font-medium mt-1">
                Autonomous Institution • NAAC A++ Grade Accredited • NBA Tier-1 Programs
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-slate-900">Academic Year: {academicYear}</div>
              <div className="text-slate-500 text-[11px]">Audit Date: {reportDate}</div>
              <div className="text-slate-500 text-[11px] font-mono mt-0.5">Dossier ID: AUD-{academicYear}-089</div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            1. Executive Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            This comprehensive institutional audit examines institutional performance across five key areas: Admissions, Student Academic Risk, Faculty Publications, Research Funding, and Faculty Work Completion for Academic Year {academicYear}. While computing programs and research publication volume remain buoyant, the analysis detects critical early warnings in branch-specific admissions vacancies (-10.81% YoY), student academic vulnerability ({highRiskStudents.length} high-risk students), and extramural grant contraction (-11.82% YoY). Proactive interventions are formulated to mitigate emerging risks before accreditation cycles.
          </p>
        </section>

        {/* Section 2: Current Institutional Situation */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            2. Current Institutional Situation
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
            {currentSituationNarrative.map((narrative, idx) => (
              <li key={idx} className="leading-relaxed">
                {narrative}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 3: Admissions Analysis */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            3. Admissions & Intake Analysis
          </h3>
          <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded border border-slate-200 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Applications</span>
              <div className="font-bold text-slate-900">{currentAdm?.applications.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Admissions</span>
              <div className="font-bold text-indigo-700">{currentAdm?.admissions.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Vacancy Rate</span>
              <div className="font-bold text-rose-600">{currentAdm?.vacancyRate.toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Conversion</span>
              <div className="font-bold text-slate-800">{currentAdm?.conversionRate.toFixed(1)}%</div>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Observation: Admissions are bifurcated. Computer Science and AIML branches exhibit 100% capacity utilization. Conversely, Mechanical Engineering (49.2% vacancy) and Electrical Engineering (45.8% vacancy) exhibit severe capacity deficits.
          </p>
        </section>

        {/* Section 4: Academic Risk Analysis */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            4. Student Academic Risk Analysis
          </h3>
          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-red-700">{highRiskStudents.length} Students</span> meet critical early-warning criteria.
            </div>
            <RiskBadge level="HIGH" size="sm" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Criteria breakdown: High risk is triggered when attendance drops below 60%, internal exam marks drop below 40%, or active backlogs exceed 3. Early academic counseling, guardian notification, and weekly remedial sessions are underway.
          </p>
        </section>

        {/* Section 5: Faculty Publications */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            5. Faculty Publications Analysis
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            Total verified indexed publications stand at <strong>{totalPubs} papers</strong>. Research activity remains strong in AI and signal processing. In accordance with developmental governance guidelines, minor output fluctuations are monitored constructively through Article Processing Charge (APC) support and conference travel grants.
          </p>
        </section>

        {/* Section 6: Research Funding */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            6. Research Funding Analysis
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            Sponsored extramural capital for AY {academicYear} totals <strong>{formatINR(totalFunding, false)}</strong> ({formatINR(totalFunding, true)}). While external agency awards (DST, SERB) continue, total funding contracted by 11.82% YoY due to completion of legacy multi-year DRDO and AICTE projects.
          </p>
        </section>

        {/* Section 7: Faculty Work Completion */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            7. Faculty Work Completion Analysis
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            Overall institutional task completion rate is recorded at <strong>84.6%</strong>. Overdue milestones concentrate in continuous internal evaluation entry windows. This represents an operational process timeline indicator rather than an evaluative appraisal.
          </p>
        </section>

        {/* Section 8: Historical Trends */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            8. Longitudinal Historical Trends
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600">
                <tr>
                  <th className="p-2">Academic Year</th>
                  <th className="p-2">Admissions</th>
                  <th className="p-2">High Risk Cohort</th>
                  <th className="p-2">Publications</th>
                  <th className="p-2">Funding (INR)</th>
                  <th className="p-2">Work Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="p-2 font-bold">AY 2022-23</td>
                  <td className="p-2">3,950</td>
                  <td className="p-2">31</td>
                  <td className="p-2">188</td>
                  <td className="p-2">₹5.40 Cr</td>
                  <td className="p-2">90.1%</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">AY 2023-24</td>
                  <td className="p-2">3,880</td>
                  <td className="p-2">37</td>
                  <td className="p-2">196</td>
                  <td className="p-2">₹5.70 Cr</td>
                  <td className="p-2">88.5%</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">AY 2024-25</td>
                  <td className="p-2">3,700</td>
                  <td className="p-2">37</td>
                  <td className="p-2">192</td>
                  <td className="p-2">₹5.50 Cr</td>
                  <td className="p-2">86.8%</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-2 font-bold text-indigo-700">AY 2025-26 (Curr)</td>
                  <td className="p-2 font-bold text-indigo-700">3,300</td>
                  <td className="p-2 font-bold text-rose-600">42</td>
                  <td className="p-2 font-bold">184</td>
                  <td className="p-2 font-bold">₹4.85 Cr</td>
                  <td className="p-2 font-bold">84.6%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 9: Emerging Risks */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            9. Emerging Risk Predictions & Forewarning
          </h3>
          <div className="space-y-2 text-xs">
            {emergingRisks.map((risk) => (
              <div key={risk.id} className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{risk.kpiTitle}</span>
                  <span className="font-mono text-[10px] text-slate-500">Confidence: {risk.confidenceScore}%</span>
                </div>
                <p className="text-slate-600 italic mb-1">
                  Estimated Trajectory: &ldquo;{risk.estimatedFutureDirection}&rdquo;
                </p>
                <div className="text-[11px] text-indigo-900">
                  <strong>Intervention:</strong> {risk.intervention}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 10: Key Observations */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            10. Key Governance Observations & Resolutions
          </h3>
          <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Mandatory Academic Tutoring:</strong> Direct HODs to implement Saturday remedial instruction for the 42 students flagged at academic risk prior to mid-term exam cycle.
            </li>
            <li>
              <strong>Research Seed Capitalization:</strong> Authorize ₹25 Lakhs from institutional reserves for seed funding interdisciplinary proposals targeting upcoming SERB/DST calls.
            </li>
            <li>
              <strong>Curriculum Modernization:</strong> Authorize academic board to infuse AI & Robotics minor options into Mechanical and EEE programs to combat seat vacancy.
            </li>
          </ol>
        </section>

        {/* Signatures */}
        <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-10 border-b border-slate-400 mb-1" />
            <div className="font-bold text-slate-900">Dr. Ramesh Sundaram</div>
            <div className="text-[10px] text-slate-500">Dean of Academic Affairs</div>
          </div>
          <div>
            <div className="h-10 border-b border-slate-400 mb-1" />
            <div className="font-bold text-slate-900">Dr. Arvind Joshi</div>
            <div className="text-[10px] text-slate-500">Director, Internal Quality Assurance (IQAC)</div>
          </div>
          <div>
            <div className="h-10 border-b border-slate-400 mb-1" />
            <div className="font-bold text-slate-900">Prof. B. K. Sharma</div>
            <div className="text-[10px] text-slate-500">Chairperson, Academic Senate</div>
          </div>
        </div>
      </div>
    </div>
  );
};
