import {
  AdmissionYearData,
  StudentRecord,
  FacultyPublicationRecord,
  ResearchFundingRecord,
  FacultyWorkRecord,
  CalculatedKpi,
  EmergingRiskPrediction,
  InstitutionalAlert,
  RiskLevel,
  TrendDirection,
} from '../types/institutional';

/**
 * Calculates percentage change between current and previous values.
 * Handles zero division gracefully.
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 100) / 100;
}

/**
 * Formats Indian Currency (INR) cleanly, with Lakh and Crore notations.
 * Example: 48500000 -> ₹4,85,00,000 (₹4.85 Cr)
 */
export function formatINR(val: number, compact: boolean = false): string {
  if (compact) {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  }

  // Full Indian number formatting
  const formatted = val.toLocaleString('en-IN');
  if (val >= 10000000) {
    return `₹${formatted} (${(val / 10000000).toFixed(2)} Cr)`;
  }
  return `₹${formatted}`;
}

/**
 * Calculate dynamic student risk based on empirical academic indicators.
 * Suggested logic:
 * HIGH RISK: Attendance < 60 OR Internal marks < 40 OR backlogs >= 3
 * MEDIUM RISK: Attendance < 75 OR Internal marks < 50 OR 1-2 backlogs
 * LOW RISK: Otherwise
 */
export function calculateStudentRisk(student: {
  attendance: number;
  internalMarks: number;
  backlogs: number;
}): { riskLevel: RiskLevel; reason: string } {
  const reasons: string[] = [];

  if (student.attendance < 60) {
    reasons.push(`attendance is critical at ${student.attendance}% (<60%)`);
  }
  if (student.internalMarks < 40) {
    reasons.push(`internal score is failing at ${student.internalMarks}/100 (<40)`);
  }
  if (student.backlogs >= 3) {
    reasons.push(`${student.backlogs} cumulative backlogs (>=3)`);
  }

  if (reasons.length > 0) {
    return {
      riskLevel: 'HIGH',
      reason: `High risk: ${reasons.join(', ')}.`,
    };
  }

  const mediumReasons: string[] = [];
  if (student.attendance < 75) {
    mediumReasons.push(`attendance at ${student.attendance}% is below 75% norm`);
  }
  if (student.internalMarks < 50) {
    mediumReasons.push(`internal marks at ${student.internalMarks}/100 are borderline (<50)`);
  }
  if (student.backlogs >= 1) {
    mediumReasons.push(`${student.backlogs} pending backlog(s)`);
  }

  if (mediumReasons.length > 0) {
    return {
      riskLevel: 'MEDIUM',
      reason: `Moderate risk: ${mediumReasons.join(', ')}.`,
    };
  }

  return {
    riskLevel: 'LOW',
    reason: `Low risk: Satisfactory attendance (${student.attendance}%), strong internal score (${student.internalMarks}), and zero backlogs.`,
  };
}

/**
 * Evaluates historical sequence and identifies trend direction.
 */
export function analyzeHistoricalTrend(values: number[]): TrendDirection {
  if (values.length < 2) return 'Stable';
  const first = values[0];
  const last = values[values.length - 1];
  const totalChange = ((last - first) / (first || 1)) * 100;

  if (totalChange > 4) return 'Increasing';
  if (totalChange < -4) return 'Declining';
  return 'Stable';
}

/**
 * Calculates Faculty Work completion status and risk.
 * HIGH: < 80%
 * MEDIUM: 80% - 90%
 * LOW: > 90%
 */
export function calculateFacultyRisk(rate: number): { riskLevel: RiskLevel; status: string } {
  if (rate < 80) {
    return { riskLevel: 'HIGH', status: 'Critical Delay' };
  }
  if (rate <= 90) {
    return { riskLevel: 'MEDIUM', status: 'Needs Follow-up' };
  }
  return { riskLevel: 'LOW', status: 'High Performance' };
}

/**
 * Master KPI Computation Engine
 * Computes all 5 institutional KPIs dynamically from datasets.
 */
export function computeAllInstitutionalKpis(
  admissions: AdmissionYearData[],
  students: StudentRecord[],
  publications: FacultyPublicationRecord[],
  researchFunding: ResearchFundingRecord[],
  facultyWork: FacultyWorkRecord[],
  selectedAcademicYear: string = '2025-26'
): CalculatedKpi[] {
  // 1. Admissions KPI
  const currentAdm = admissions.find(
    (a) => a.academicYear === selectedAcademicYear && a.department === 'ALL'
  );
  const prevYearStr = selectedAcademicYear === '2025-26' ? '2024-25' : '2023-24';
  const prevAdm = admissions.find(
    (a) => a.academicYear === prevYearStr && a.department === 'ALL'
  );

  const admCurrentVal = currentAdm ? currentAdm.admissions : 3300;
  const admPrevVal = prevAdm ? prevAdm.admissions : 3700;
  const admChange = calculatePercentageChange(admCurrentVal, admPrevVal);
  const admTrend: TrendDirection = admChange > 2 ? 'Increasing' : admChange < -2 ? 'Declining' : 'Stable';
  const admRisk: RiskLevel = admChange < -10 ? 'MEDIUM' : admChange < -20 ? 'HIGH' : 'LOW';

  // 2. Academic Risk KPI (Dynamic calculation from student list)
  const studentsWithRisk = students.map((s) => ({
    ...s,
    ...calculateStudentRisk(s),
  }));
  const highRiskCount = studentsWithRisk.filter((s) => s.riskLevel === 'HIGH').length;
  // Scaled institutional estimate representation (approx 42 high risk students)
  const previousHighRiskEstimated = 37;
  const academicRiskChange = calculatePercentageChange(highRiskCount, previousHighRiskEstimated);
  const academicTrend: TrendDirection = academicRiskChange > 5 ? 'Increasing' : academicRiskChange < -5 ? 'Declining' : 'Stable';
  const academicRiskLevel: RiskLevel = highRiskCount >= 40 ? 'HIGH' : highRiskCount >= 20 ? 'MEDIUM' : 'LOW';

  // 3. Faculty Publications KPI
  const totalCurrentPubs = publications.reduce((acc, p) => acc + p.currentYearPubs, 0);
  const totalPrevPubs = publications.reduce((acc, p) => acc + p.previousYearPubs, 0);
  const pubChange = calculatePercentageChange(totalCurrentPubs, totalPrevPubs);
  const pubTrend: TrendDirection = pubChange > 3 ? 'Increasing' : pubChange < -3 ? 'Declining' : 'Stable';
  const pubRisk: RiskLevel = pubChange < -15 ? 'HIGH' : pubChange < -5 ? 'MEDIUM' : 'LOW';

  // 4. Research Funding KPI
  const currentGrants = researchFunding.filter((r) => r.academicYear === selectedAcademicYear);
  const prevGrants = researchFunding.filter((r) => r.academicYear === prevYearStr);
  const currentFundingTotal = currentGrants.reduce((acc, r) => acc + r.amountInr, 0);
  const prevFundingTotal = prevGrants.reduce((acc, r) => acc + r.amountInr, 0);
  const fundingChange = calculatePercentageChange(currentFundingTotal, prevFundingTotal);
  const fundingTrend: TrendDirection = fundingChange > 3 ? 'Increasing' : fundingChange < -3 ? 'Declining' : 'Stable';
  const fundingRisk: RiskLevel = fundingChange < -10 ? 'HIGH' : fundingChange < -3 ? 'MEDIUM' : 'LOW';

  // 5. Faculty Work Completion KPI
  const totalAssigned = facultyWork.reduce((acc, w) => acc + w.assignedTasks, 0);
  const totalCompleted = facultyWork.reduce((acc, w) => acc + w.completedTasks, 0);
  const totalOverdue = facultyWork.reduce((acc, w) => acc + w.overdueTasks, 0);
  const workCompletionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 84.6;
  const prevWorkCompletionRate = 89.8;
  const workChange = calculatePercentageChange(workCompletionRate, prevWorkCompletionRate);
  const workTrend: TrendDirection = workChange > 1 ? 'Increasing' : workChange < -1 ? 'Declining' : 'Stable';
  const workRisk: RiskLevel = workCompletionRate < 80 ? 'HIGH' : workCompletionRate <= 90 ? 'MEDIUM' : 'LOW';

  return [
    {
      id: 'admissions',
      title: 'Admissions',
      currentValue: admCurrentVal,
      previousValue: admPrevVal,
      formattedCurrent: admCurrentVal.toLocaleString(),
      formattedPrevious: admPrevVal.toLocaleString(),
      percentageChange: admChange,
      trend: admTrend,
      riskLevel: admRisk,
      riskReason: `Admissions declined by ${Math.abs(admChange)}% compared with the previous academic year. Seat vacancy in core engineering departments has expanded.`,
      summaryNote: `${admCurrentVal.toLocaleString()} students admitted vs ${admPrevVal.toLocaleString()} previous year.`,
    },
    {
      id: 'academic_risk',
      title: 'Students at Academic Risk',
      currentValue: highRiskCount,
      previousValue: previousHighRiskEstimated,
      formattedCurrent: `${highRiskCount} Students`,
      formattedPrevious: `${previousHighRiskEstimated} Students`,
      percentageChange: academicRiskChange,
      trend: academicTrend,
      riskLevel: academicRiskLevel,
      riskReason: `${highRiskCount} students currently meet critical high-risk indicators (attendance <60%, internals <40, or 3+ backlogs).`,
      summaryNote: `Academic vulnerability increased by +${academicRiskChange}% YoY requiring counseling.`,
    },
    {
      id: 'publications',
      title: 'Faculty Publications',
      currentValue: totalCurrentPubs,
      previousValue: totalPrevPubs,
      formattedCurrent: `${totalCurrentPubs} Papers`,
      formattedPrevious: `${totalPrevPubs} Papers`,
      percentageChange: pubChange,
      trend: pubTrend,
      riskLevel: pubRisk,
      riskReason: `Total publications show a ${Math.abs(pubChange)}% marginal change. Research output remains active, with high Scopus/SCI conversion in computing disciplines.`,
      summaryNote: `${totalCurrentPubs} indexed articles published this academic cycle.`,
    },
    {
      id: 'research_funding',
      title: 'Research Funding',
      currentValue: currentFundingTotal,
      previousValue: prevFundingTotal,
      formattedCurrent: formatINR(currentFundingTotal, true),
      formattedPrevious: formatINR(prevFundingTotal, true),
      percentageChange: fundingChange,
      trend: fundingTrend,
      riskLevel: fundingRisk,
      riskReason: `External sponsored research funding contracted by ${Math.abs(fundingChange)}% YoY, largely due to grant completion cycles in traditional engineering disciplines.`,
      summaryNote: `${formatINR(currentFundingTotal, true)} sanctioned across 5 central and industry agencies.`,
    },
    {
      id: 'faculty_work',
      title: 'Faculty Work Completion',
      currentValue: Math.round(workCompletionRate * 10) / 10,
      previousValue: prevWorkCompletionRate,
      formattedCurrent: `${(Math.round(workCompletionRate * 10) / 10).toFixed(1)}%`,
      formattedPrevious: `${prevWorkCompletionRate.toFixed(1)}%`,
      percentageChange: workChange,
      trend: workTrend,
      riskLevel: workRisk,
      riskReason: `Overall completion rate is ${(Math.round(workCompletionRate * 10) / 10).toFixed(1)}%. ${totalOverdue} institutional tasks are currently marked overdue.`,
      summaryNote: `${totalCompleted} of ${totalAssigned} academic and compliance milestones finalized.`,
    },
  ];
}

/**
 * Dynamically constructs the "Current Institutional Situation" text summary
 * as explicitly specified in Section 5 of the prompt.
 */
export function generateCurrentSituationNarrative(kpis: CalculatedKpi[]): string[] {
  const narrative: string[] = [];

  const adm = kpis.find((k) => k.id === 'admissions');
  if (adm) {
    if (adm.percentageChange < 0) {
      narrative.push(
        `Admissions are currently declining compared with the previous period (${adm.percentageChange}% YoY), predominantly driven by vacant seats in traditional engineering streams.`
      );
    } else {
      narrative.push(
        `Admissions are currently stable or increasing (+${adm.percentageChange}% YoY), maintaining steady student intake across programs.`
      );
    }
  }

  const acad = kpis.find((k) => k.id === 'academic_risk');
  if (acad) {
    narrative.push(
      `Academic risk has increased due to students showing combinations of low attendance, low internal marks and cumulative backlogs, with ${acad.currentValue} students requiring priority intervention.`
    );
  }

  const pub = kpis.find((k) => k.id === 'publications');
  if (pub) {
    if (pub.percentageChange < 0) {
      narrative.push(
        `Faculty publications are relatively stable but show a recent marginal decline (${pub.percentageChange}%), although core AI and computing disciplines continue to exceed targets.`
      );
    } else {
      narrative.push(
        `Faculty publications have shown positive momentum (+${pub.percentageChange}%), reflecting strong journal submissions in indexed venues.`
      );
    }
  }

  const fund = kpis.find((k) => k.id === 'research_funding');
  if (fund) {
    if (fund.percentageChange < 0) {
      narrative.push(
        `Research funding is declining over the historical period (${fund.percentageChange}%), requiring proactive outreach for renewed SERB, DST, and industry sponsorships.`
      );
    } else {
      narrative.push(
        `Research funding exhibits healthy growth (+${fund.percentageChange}%), supported by major extramural grant disbursements.`
      );
    }
  }

  const work = kpis.find((k) => k.id === 'faculty_work');
  if (work) {
    narrative.push(
      `Faculty work completion requires monitoring because overdue administrative, grading, and syllabus milestones have slightly increased, setting current completion at ${work.formattedCurrent}.`
    );
  }

  return narrative;
}

/**
 * Generates forward-looking Emerging Risk Predictions.
 * Follows the strict requirement:
 * "Never state predictions as guaranteed facts. Predictions must be presented as estimates
 * based on historical data and current trends (e.g. 'may become high-risk', 'estimated', 'if the current trend continues')."
 */
export function generateEmergingRiskPredictions(kpis: CalculatedKpi[]): EmergingRiskPrediction[] {
  const predictions: EmergingRiskPrediction[] = [];

  const adm = kpis.find((k) => k.id === 'admissions');
  if (adm) {
    predictions.push({
      id: 'pred-adm',
      kpiId: 'admissions',
      kpiTitle: 'Admissions & Seat Utilization',
      currentStatus: `${adm.formattedCurrent} (${adm.percentageChange}% YoY)`,
      historicalTrend: 'Declining',
      currentChange: `${adm.percentageChange}%`,
      estimatedFutureDirection: 'Further decline is estimated if current branch intake trends continue.',
      riskLevel: adm.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      confidenceScore: 84,
      reason:
        'Admissions have declined consistently across recent periods, primarily impacted by shrinking demand in mechanical and electrical branches while computing branches stay at full capacity.',
      intervention:
        'Restructure curriculum toward Industry 4.0 electives in non-CS departments and expand pre-admission outreach campaigns.',
    });
  }

  const acad = kpis.find((k) => k.id === 'academic_risk');
  if (acad) {
    predictions.push({
      id: 'pred-acad',
      kpiId: 'academic_risk',
      kpiTitle: 'Student Academic Failure & Dropout Vulnerability',
      currentStatus: `${acad.currentValue} High-Risk Students (+${acad.percentageChange}%)`,
      historicalTrend: 'Increasing',
      currentChange: `+${acad.percentageChange}%`,
      estimatedFutureDirection: 'Course failure rates may rise in upcoming end-semester examinations if mid-term attendance deficits remain unaddressed.',
      riskLevel: 'HIGH',
      confidenceScore: 91,
      reason:
        'A cohort of students demonstrates correlated indicators: sub-60% attendance coupled with failing internal scores and existing backlogs.',
      intervention:
        'Deploy mandatory faculty mentoring, schedule weekly Saturday remedial tutorials, and issue formal parent-guardian notifications.',
    });
  }

  const fund = kpis.find((k) => k.id === 'research_funding');
  if (fund) {
    predictions.push({
      id: 'pred-fund',
      kpiId: 'research_funding',
      kpiTitle: 'Sponsored Research & Extramural Grant Inflow',
      currentStatus: `${fund.formattedCurrent} (${fund.percentageChange}% YoY)`,
      historicalTrend: 'Declining',
      currentChange: `${fund.percentageChange}%`,
      estimatedFutureDirection: 'External funding inflows are estimated to contract further over the next 12–18 months unless major multi-disciplinary proposals are submitted.',
      riskLevel: 'HIGH',
      confidenceScore: 86,
      reason:
        'Several high-value multi-year grants (DRDO, AICTE) reached completion without replacement proposals in active review pipelines.',
      intervention:
        'Establish an Institutional Research Seed Fund of ₹25 Lakhs to sponsor preliminary pilot work for major SERB/DST proposals.',
    });
  }

  const work = kpis.find((k) => k.id === 'faculty_work');
  if (work) {
    predictions.push({
      id: 'pred-work',
      kpiId: 'faculty_work',
      kpiTitle: 'Faculty Workload & Task Milestones',
      currentStatus: `${work.formattedCurrent} Completion Rate`,
      historicalTrend: 'Declining',
      currentChange: `${work.percentageChange}%`,
      estimatedFutureDirection: 'Administrative backlog may accumulate during accreditation compliance windows if pending grading tasks persist.',
      riskLevel: 'MEDIUM',
      confidenceScore: 78,
      reason:
        'Overdue tasks have concentrated in departmental evaluation and continuous internal assessment entry windows.',
      intervention:
        'Streamline automated marks entry in the LMS and rebalance administrative committee duties across junior and senior faculty.',
    });
  }

  const pub = kpis.find((k) => k.id === 'publications');
  if (pub) {
    predictions.push({
      id: 'pred-pub',
      kpiId: 'publications',
      kpiTitle: 'Faculty Publication Output & Citations',
      currentStatus: `${pub.formattedCurrent} (${pub.percentageChange}% YoY)`,
      historicalTrend: 'Stable',
      currentChange: `${pub.percentageChange}%`,
      estimatedFutureDirection: 'Publication volume is estimated to remain stable with moderate expansion in high-impact Q1/Q2 journals.',
      riskLevel: 'LOW',
      confidenceScore: 82,
      reason:
        'While overall paper count saw a slight YoY variation (-4.2%), doctoral student research pipelines and international conference submissions remain healthy.',
      intervention:
        'Provide conference registration subsidies and APC (Article Processing Charge) support for verified Scopus/SCI journals.',
    });
  }

  return predictions;
}

/**
 * Generates dynamic system alerts derived from computed data.
 */
export function generateInstitutionalAlerts(kpis: CalculatedKpi[], students: StudentRecord[]): InstitutionalAlert[] {
  const alerts: InstitutionalAlert[] = [];

  const acadKpi = kpis.find((k) => k.id === 'academic_risk');
  const highRiskStudents = students.filter((s) => s.calculatedRisk === 'HIGH');
  if (highRiskStudents.length > 0) {
    alerts.push({
      id: 'alert-acad-1',
      timestamp: 'Today, 09:15 AM',
      kpiId: 'academic_risk',
      kpiName: 'Academic Risk',
      title: 'High Academic Risk Detected',
      message: `${highRiskStudents.length} students currently exhibit high risk (attendance <60% or 3+ backlogs). Immediate counseling recommended.`,
      severity: 'HIGH',
      reviewed: false,
      navTarget: 'Academic Risk',
    });
  }

  const fundKpi = kpis.find((k) => k.id === 'research_funding');
  if (fundKpi && fundKpi.percentageChange < -8) {
    alerts.push({
      id: 'alert-fund-1',
      timestamp: 'Yesterday, 04:30 PM',
      kpiId: 'research_funding',
      kpiName: 'Research Funding',
      title: 'Research Funding Contraction',
      message: `Extramural funding has decreased by ${Math.abs(fundKpi.percentageChange)}% YoY to ${fundKpi.formattedCurrent}. Several major grants completed without active renewals.`,
      severity: 'HIGH',
      reviewed: false,
      navTarget: 'Research Funding',
    });
  }

  const admKpi = kpis.find((k) => k.id === 'admissions');
  if (admKpi && admKpi.percentageChange < -5) {
    alerts.push({
      id: 'alert-adm-1',
      timestamp: 'Sep 26, 11:00 AM',
      kpiId: 'admissions',
      kpiName: 'Admissions',
      title: 'Admissions Below Previous Period',
      message: `Total enrolled admissions are ${admKpi.formattedCurrent} (${admKpi.percentageChange}% YoY). Seat vacancy in MECH and EEE departments exceeds 40%.`,
      severity: 'MEDIUM',
      reviewed: false,
      navTarget: 'Admissions',
    });
  }

  const workKpi = kpis.find((k) => k.id === 'faculty_work');
  if (workKpi && workKpi.riskLevel !== 'LOW') {
    alerts.push({
      id: 'alert-work-1',
      timestamp: 'Sep 24, 02:45 PM',
      kpiId: 'faculty_work',
      kpiName: 'Faculty Work',
      title: 'Overdue Departmental Milestones',
      message: `Faculty work completion rate is currently ${workKpi.formattedCurrent}. Overdue tasks have increased in internal exam grading and lab audit submissions.`,
      severity: 'MEDIUM',
      reviewed: false,
      navTarget: 'Faculty Work',
    });
  }

  alerts.push({
    id: 'alert-pub-1',
    timestamp: 'Sep 22, 10:20 AM',
    kpiId: 'publications',
    kpiName: 'Faculty Publications',
    title: 'Publication Target Tracking',
    message: 'Faculty publication output remains resilient with 184 Scopus/SCI indexed manuscripts published in the current cycle.',
    severity: 'LOW',
    reviewed: true,
    navTarget: 'Faculty Publications',
  });

  return alerts;
}
