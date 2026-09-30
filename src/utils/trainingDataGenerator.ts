/**
 * AI Training Dataset Generator for Institutional KPI Prediction Agent
 * Provides high-fidelity datasets formatted for:
 * 1. LLM / Gemini Instruction Fine-Tuning (JSONL format with system prompt, user prompt, structured assistant target)
 * 2. Supervised Machine Learning / Tabular Datasets (CSV & JSON for Student Risk, Admissions, Funding, Faculty Work)
 */

export interface LLMTrainingSample {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

export interface StudentRiskMLRecord {
  student_id: string;
  department: string;
  semester: number;
  attendance_pct: number;
  internal_marks_100: number;
  midterm_score_50: number;
  assignment_completion_pct: number;
  lab_attendance_pct: number;
  cumulative_backlogs: number;
  prior_semester_sgpa: number;
  mentor_meetings_attended: number;
  parent_notified_flag: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  dropout_probability_pct: number;
  remedial_required_flag: number;
}

export interface AdmissionsForecastRecord {
  record_id: string;
  academic_year: string;
  department: string;
  applications_received: number;
  available_capacity: number;
  prior_year_admissions: number;
  prior_year_vacancy_pct: number;
  regional_placement_index: number; // 0-100
  industry_demand_score: number; // 0-100
  curriculum_revision_age_years: number;
  target_admissions: number;
  target_vacancy_pct: number;
  target_risk_category: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Supervised Instruction-Tuning Pairs (JSONL) for Gemini / LLM Agents
 */
export const LLM_FINE_TUNING_SAMPLES: LLMTrainingSample[] = [
  {
    messages: [
      {
        role: 'system',
        content: `You are the Institutional KPI Analysis and Early Warning Agent for college/university administration.
Evaluate performance across: Admissions, Students at Academic Risk, Faculty Publications, Research Funding, and Faculty Work Completion.
Ground all reasoning strictly in provided institutional data. Never state predictions as certainties—frame them as estimates based on historical trends (e.g., 'may become high-risk if current trends continue').
When assessing institutional status, format responses with:
CURRENT SITUATION
RISK AREAS
HISTORICAL TREND
EMERGING RISKS
KEY OBSERVATIONS`,
      },
      {
        role: 'user',
        content: `Institutional Context:
Admissions: 3,300 (Previous: 3,700, -10.81% YoY, Vacancy: 19.51%, MECH vacancy: 49.2%, EEE vacancy: 45.8%, CSE: 0.8% vacancy).
Students at Academic Risk: 42 High-Risk students (+13.51% YoY).
Faculty Publications: 184 Scopus/SCI indexed papers (-4.17% YoY).
Research Funding: ₹4.85 Crore (Previous: ₹5.50 Crore, -11.82% YoY).
Faculty Work Completion: 84.6% (Previous: 89.8%, Overdue tasks: 15).

Question: Provide an executive review of current institutional performance and risk indicators.`,
      },
      {
        role: 'assistant',
        content: `CURRENT SITUATION:
The institution operates with stable core academic programs, but five monitored KPIs demonstrate emerging vulnerabilities: Admissions contracted to 3,300 students (-10.81% YoY, Medium Risk), Academic Risk cohort expanded to 42 high-risk students (+13.51% YoY, High Risk), Faculty Publications stand at 184 indexed papers (-4.17% YoY, Low Risk), Research Funding contracted to ₹4.85 Crore (-11.82% YoY, High Risk), and Faculty Task Completion rate is 84.6% (-5.2% YoY, Medium Risk).

RISK AREAS:
1. Student Academic Vulnerability: 42 students exhibit severe co-occurring risk factors (attendance below 60%, internal exam marks below 40%, and 3+ backlogs).
2. Branch-Level Admissions Bifurcation: Severe seat vacancies in Mechanical (49.2%) and Electrical Engineering (45.8%) threaten departmental unit economics and student-faculty ratios, while CSE and AIML operate at full capacity.
3. Extramural Grant Renewal Gap: A -11.82% contraction in sponsored research following the conclusion of legacy multi-year DRDO and AICTE projects without active renewal proposals in the pipeline.

HISTORICAL TREND:
Admissions (3,950 → 3,880 → 3,700 → 3,300) and sponsored research funding (₹5.40 Cr → ₹5.70 Cr → ₹5.50 Cr → ₹4.85 Cr) demonstrate persistent downward trajectories over the past 3-4 cycles. Conversely, faculty publication velocity remains relatively resilient near institutional baselines.

EMERGING RISKS:
- If current intake trends continue, seat vacancy in non-CS engineering disciplines may surpass 55% in the subsequent academic cycle.
- High-risk student cohorts are estimated to experience elevated end-semester examination failure rates unless mandatory mid-term remedial coaching is instituted.
- External research funding inflows are projected to contract further over the next 12–18 months without interdisciplinary grant submissions to central agencies.

KEY OBSERVATIONS:
1. Institute mandatory Saturday remedial tutorials and guardian counseling for the 42 identified students before the mid-term window.
2. Capitalize an Institutional Research Seed Fund of ₹25 Lakhs to sponsor preliminary pilot work for upcoming SERB and DST grant deadlines.
3. Modernize traditional branch curricula by integrating AI, Robotics, and IoT electives to curb enrollment decline.`,
      },
    ],
  },
  {
    messages: [
      {
        role: 'system',
        content: `You are the Institutional KPI Analysis and Early Warning Agent for college/university administration.
Ground answers strictly in provided institutional data. Formulate probabilistic early warnings, never absolute certainties.`,
      },
      {
        role: 'user',
        content: `Admissions Context:
Total Applications: 6,450. Total Admissions: 3,300. Sanctioned Seats: 4,100. Vacancy Rate: 19.51%.
Branch Breakdown:
CSE: 1,240 filled / 1,250 seats (0.8% vacancy)
AIML: 780 filled / 780 seats (0% vacancy)
ECE: 570 filled / 720 seats (20.8% vacancy)
EEE: 390 filled / 720 seats (45.8% vacancy)
MECH: 320 filled / 630 seats (49.2% vacancy)

Question: Why are admissions declining, and which branches present the highest operational risk?`,
      },
      {
        role: 'assistant',
        content: `CURRENT SITUATION:
Institutional admissions have contracted by -10.81% YoY to 3,300 enrolled candidates, yielding an overall campus vacancy rate of 19.51% against 4,100 sanctioned seats.

RISK AREAS:
The decline is almost entirely concentrated in non-computing disciplines:
- Mechanical Engineering: 49.2% vacancy (only 320 seats filled out of 630).
- Electrical & Electronics Engineering: 45.8% vacancy (390 filled out of 720).
- Electronics & Communication: 20.8% vacancy (570 filled out of 720).
In contrast, Computer Science and AIML maintain full seat saturation with 0% to 0.8% vacancy.

HISTORICAL TREND:
Admissions have dropped progressively over 4 consecutive years: 3,950 (AY 2022-23) → 3,880 → 3,700 → 3,300 (AY 2025-26). Applications have similarly receded from 7,200 to 6,450 (-10.4%).

EMERGING RISKS:
If branch preference disparities persist along current trajectories, vacancy in Mechanical and Electrical streams is estimated to exceed 50%, resulting in under-utilized specialized laboratory infrastructure and unfavorable accreditation student-faculty ratios.

KEY OBSERVATIONS:
1. Re-align curriculum by embedding Industry 4.0, Electric Vehicle technology, and Embedded AI specializations into core engineering departments.
2. Launch targeted pre-admission counselling in regional feeder higher-secondary schools to communicate high placement prospects in modernized core roles.`,
      },
    ],
  },
  {
    messages: [
      {
        role: 'system',
        content: `You are the Institutional KPI Analysis and Early Warning Agent for college/university administration.
Evaluate academic risk indicators: Attendance <60%, Internal Marks <40, Backlogs >=3.`,
      },
      {
        role: 'user',
        content: `Student Academic Risk Data:
Active Cohort: 30 sample records (42 total high-risk across institution).
Identified High-Risk Profiles:
- STU2023-CS041 (Aakash Verma, CSE Sem 5): Attendance 52%, Internals 34/100, 4 Backlogs.
- STU2023-AI019 (Kavita Menon, AIML Sem 4): Attendance 58%, Internals 38/100, 3 Backlogs.
- STU2022-EC078 (Siddharth Rao, ECE Sem 7): Attendance 48%, Internals 31/100, 5 Backlogs.
- STU2023-EE022 (Harsh Vardhan, EEE Sem 5): Attendance 55%, Internals 36/100, 3 Backlogs.
- STU2022-ME054 (Nikhil Patil, MECH Sem 6): Attendance 51%, Internals 39/100, 4 Backlogs.

Question: Which students are currently at high academic risk and what intervention protocol should the Academic Senate enforce?`,
      },
      {
        role: 'assistant',
        content: `CURRENT SITUATION:
42 students across departments currently meet the high-risk early warning threshold, representing an increase from 37 students in the prior academic cycle (+13.51% YoY).

RISK AREAS:
High-risk students display a tri-fold vulnerability pattern:
1. Critical Attendance Shortfall: Sub-60% attendance (e.g., Siddharth Rao at 48%, Nikhil Patil at 51%, Aakash Verma at 52%).
2. Failing Internal Assessment: Continuous internal assessment scores failing below 40% (e.g., Siddharth Rao at 31/100, Kavita Menon at 38/100).
3. Backlog Accumulation: 3 to 5 accumulated backlogs across foundational math and circuit analysis subjects.

HISTORICAL TREND:
The high-risk cohort has expanded steadily over the past four monitoring intervals: 28 (AY 2021-22) → 31 → 37 → 42 (AY 2025-26).

EMERGING RISKS:
Without immediate intervention, these students may face semester condonation disqualification, end-semester exam failure, and potential year-back status.

KEY OBSERVATIONS & INTERVENTIONS:
1. Issue formal guardian notifications regarding attendance shortages prior to the condonation cutoff.
2. Mandate enrollment in department-led Saturday remedial problem-solving sessions.
3. Assign senior peer tutors to assist in clearing core subject backlogs in the upcoming supplementary cycle.`,
      },
    ],
  },
  {
    messages: [
      {
        role: 'system',
        content: `You are the Institutional KPI Analysis and Early Warning Agent for college/university administration.
Evaluate extramural research grants across central agencies (DST, SERB, ISRO, AICTE, DRDO) with Indian Rupee formatting.`,
      },
      {
        role: 'user',
        content: `Research Funding Context:
AY 2025-26 Sanctioned Grants:
- CSE: SERB, ₹1.25 Cr (Dr. Ramesh Sundaram)
- AIML: DST, ₹1.80 Cr (Dr. Vikrant Roy)
- ECE: ISRO, ₹95 Lakhs (Dr. Arvind Joshi)
- EEE: AICTE, ₹45 Lakhs (Prof. B. K. Sharma)
- MECH: DRDO, ₹40 Lakhs (Dr. C. P. Deshmukh)
Total Current: ₹4.85 Crore. Previous Period: ₹5.50 Crore (-11.82% YoY). Peak Funding: ₹5.70 Crore in AY 2023-24.

Question: Analyze the research funding trajectory and recommend corrective steps.`,
      },
      {
        role: 'assistant',
        content: `CURRENT SITUATION:
Extramural sponsored research funding for AY 2025-26 stands at ₹4.85 Crore across five sanctioned central agency grants, reflecting a contraction of -11.82% YoY compared to ₹5.50 Crore in AY 2024-25.

RISK AREAS:
The contraction is primarily located in traditional engineering departments:
- Mechanical Engineering funding contracted from ₹70 Lakhs to ₹40 Lakhs (-42.8%).
- EEE funding contracted from ₹65 Lakhs to ₹45 Lakhs (-30.8%).
This drop coincides with the planned closure of multi-year DRDO and AICTE research schemes that lacked ready successor proposals.

HISTORICAL TREND:
Extramural funding progressed from ₹5.40 Crore (AY 2022-23) to a peak of ₹5.70 Crore (AY 2023-24), before declining consecutively to ₹5.50 Crore and ₹4.85 Crore.

EMERGING RISKS:
If central grant proposal submissions remain concentrated in only two departments (AIML and CSE), total institutional research revenue is estimated to fall below ₹4.20 Crore by the subsequent cycle, adversely impacting NIRF ranking scores for Research and Professional Practice (RPC).

KEY OBSERVATIONS:
1. Establish an Institutional Research Seed Fund of ₹25 Lakhs to provide matching funds for preliminary prototyping.
2. Mandate that every doctoral-granting department submit at least two proposals to upcoming SERB Core Research Grant (CRG) and DST bilateral calls.`,
      },
    ],
  },
  {
    messages: [
      {
        role: 'system',
        content: `You are the Institutional KPI Analysis and Early Warning Agent for college/university administration.
Evaluate faculty task completion metrics and workload delivery.`,
      },
      {
        role: 'user',
        content: `Faculty Work Context:
Total Tasks Assigned: 260. Tasks Completed: 220. Pending Tasks: 25. Overdue Tasks: 15.
Institutional Completion Rate: 84.6% (Previous: 89.8%, -5.2% YoY).
Department Overdues:
- MECH: 5 overdue tasks (Completion: 81.2%)
- EEE: 5 overdue tasks (Completion: 79.5%)
- ECE: 4 overdue tasks (Completion: 80.4%)
- CSE: 1 overdue task (Completion: 92.1%)
- AIML: 0 overdue tasks (Completion: 93.8%)

Question: How is faculty work completion performing, and how should overdue milestones be resolved?`,
      },
      {
        role: 'assistant',
        content: `CURRENT SITUATION:
Overall institutional faculty work completion rate is 84.6% (-5.2% YoY), with 220 of 260 assigned milestones completed and 15 marked overdue (MEDIUM RISK).

RISK AREAS:
Overdue milestones are concentrated in EEE (5 overdue, 79.5% completion) and MECH (5 overdue, 81.2% completion). The delayed tasks primarily involve continuous internal evaluation grading entry, laboratory file verification, and OBE course outcome attainment calculations.

HISTORICAL TREND:
Timely completion was 90.1% in AY 2022-23 and 88.5% in AY 2023-24, indicating a recent operational deceleration due to overlapping accreditation audit workloads.

EMERGING RISKS:
Delayed grading and course outcome entries risk holding up end-semester grade cards and accreditation self-assessment reports (SAR) if compliance deadlines are breached.

KEY OBSERVATIONS:
1. Deploy automated marks ingestion tools within the campus Learning Management System to reduce manual faculty entry time.
2. Rebalance departmental committee responsibilities to ensure senior teaching faculty are not overloaded during examination evaluation windows.`,
      },
    ],
  },
];

/**
 * 60 High-Density Synthetic Student Records for Machine Learning (Supervised Classification)
 */
export function generateStudentRiskDataset(count = 60): StudentRiskMLRecord[] {
  const depts = ['CSE', 'AIML', 'ECE', 'EEE', 'MECH'];
  const records: StudentRiskMLRecord[] = [];

  for (let i = 1; i <= count; i++) {
    const dept = depts[i % depts.length];
    const semester = 3 + (i % 5); // Semesters 3-7

    // Distribute into 3 realistic tiers: ~25% High Risk, ~35% Medium Risk, ~40% Low Risk
    const tier = i % 4 === 0 ? 'HIGH' : i % 3 === 0 ? 'MEDIUM' : 'LOW';

    let attendance = 85;
    let internalMarks = 75;
    let midterm = 40;
    let backlogs = 0;
    let priorSgpa = 8.2;
    let assignmentPct = 90;
    let labAttendance = 90;
    let mentorMeetings = 4;
    let parentNotified = 0;
    let dropoutProb = 4;
    let remedial = 0;

    if (tier === 'HIGH') {
      attendance = Math.floor(45 + Math.random() * 14); // 45-58%
      internalMarks = Math.floor(25 + Math.random() * 14); // 25-38
      midterm = Math.floor(12 + Math.random() * 10);
      backlogs = Math.floor(3 + Math.random() * 3); // 3-5
      priorSgpa = parseFloat((5.1 + Math.random() * 0.9).toFixed(2));
      assignmentPct = Math.floor(40 + Math.random() * 20);
      labAttendance = Math.floor(48 + Math.random() * 15);
      mentorMeetings = Math.floor(1 + Math.random() * 2);
      parentNotified = 1;
      dropoutProb = Math.floor(65 + Math.random() * 25);
      remedial = 1;
    } else if (tier === 'MEDIUM') {
      attendance = Math.floor(62 + Math.random() * 12); // 62-74%
      internalMarks = Math.floor(41 + Math.random() * 12); // 41-52
      midterm = Math.floor(22 + Math.random() * 8);
      backlogs = Math.floor(1 + Math.random() * 2); // 1-2
      priorSgpa = parseFloat((6.2 + Math.random() * 0.9).toFixed(2));
      assignmentPct = Math.floor(65 + Math.random() * 15);
      labAttendance = Math.floor(68 + Math.random() * 12);
      mentorMeetings = Math.floor(2 + Math.random() * 2);
      parentNotified = Math.random() > 0.5 ? 1 : 0;
      dropoutProb = Math.floor(25 + Math.random() * 20);
      remedial = 1;
    } else {
      attendance = Math.floor(78 + Math.random() * 20); // 78-98%
      internalMarks = Math.floor(65 + Math.random() * 30); // 65-95
      midterm = Math.floor(35 + Math.random() * 14);
      backlogs = 0;
      priorSgpa = parseFloat((7.6 + Math.random() * 2.1).toFixed(2));
      assignmentPct = Math.floor(85 + Math.random() * 15);
      labAttendance = Math.floor(82 + Math.random() * 16);
      mentorMeetings = Math.floor(3 + Math.random() * 3);
      parentNotified = 0;
      dropoutProb = Math.floor(2 + Math.random() * 8);
      remedial = 0;
    }

    records.push({
      student_id: `STU-ML-${2023 + (semester > 5 ? -1 : 0)}-${dept}-${String(i).padStart(3, '0')}`,
      department: dept,
      semester,
      attendance_pct: attendance,
      internal_marks_100: internalMarks,
      midterm_score_50: midterm,
      assignment_completion_pct: assignmentPct,
      lab_attendance_pct: labAttendance,
      cumulative_backlogs: backlogs,
      prior_semester_sgpa: priorSgpa,
      mentor_meetings_attended: mentorMeetings,
      parent_notified_flag: parentNotified,
      risk_level: tier,
      dropout_probability_pct: dropoutProb,
      remedial_required_flag: remedial,
    });
  }

  return records;
}

/**
 * Multi-Year Admissions Forecasting Dataset (Time Series & Branch Dynamics)
 */
export function generateAdmissionsForecastDataset(): AdmissionsForecastRecord[] {
  const depts = ['CSE', 'AIML', 'ECE', 'EEE', 'MECH'];
  const years = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26'];
  const records: AdmissionsForecastRecord[] = [];

  let idCounter = 1;
  years.forEach((yr) => {
    depts.forEach((dept) => {
      let cap = 720;
      let apps = 1200;
      let adm = 650;
      let placementIdx = 75;
      let industryScore = 70;
      let curAge = 2;

      if (dept === 'CSE') {
        cap = 1250;
        apps = yr === '2025-26' ? 2600 : 2700;
        adm = yr === '2025-26' ? 1240 : 1250;
        placementIdx = 94;
        industryScore = 95;
      } else if (dept === 'AIML') {
        cap = 780;
        apps = yr === '2025-26' ? 1900 : 1950;
        adm = 780;
        placementIdx = 92;
        industryScore = 98;
      } else if (dept === 'ECE') {
        cap = 720;
        apps = yr === '2025-26' ? 920 : 1100;
        adm = yr === '2025-26' ? 570 : 680;
        placementIdx = 78;
        industryScore = 80;
      } else if (dept === 'EEE') {
        cap = 720;
        apps = yr === '2025-26' ? 580 : 750;
        adm = yr === '2025-26' ? 390 : 520;
        placementIdx = 62;
        industryScore = 65;
        curAge = 4;
      } else if (dept === 'MECH') {
        cap = 630;
        apps = yr === '2025-26' ? 450 : 600;
        adm = yr === '2025-26' ? 320 : 470;
        placementIdx = 58;
        industryScore = 60;
        curAge = 5;
      }

      const vac = parseFloat((((cap - adm) / cap) * 100).toFixed(1));
      const risk: 'LOW' | 'MEDIUM' | 'HIGH' = vac > 30 ? 'HIGH' : vac > 10 ? 'MEDIUM' : 'LOW';

      records.push({
        record_id: `ADM-FC-${idCounter++}`,
        academic_year: yr,
        department: dept,
        applications_received: apps,
        available_capacity: cap,
        prior_year_admissions: adm + Math.floor(Math.random() * 40 - 20),
        prior_year_vacancy_pct: Math.max(0, vac + (Math.random() * 4 - 2)),
        regional_placement_index: placementIdx,
        industry_demand_score: industryScore,
        curriculum_revision_age_years: curAge,
        target_admissions: adm,
        target_vacancy_pct: vac,
        target_risk_category: risk,
      });
    });
  });

  return records;
}

/**
 * Formats student records as CSV string
 */
export function formatStudentRiskCsv(data: StudentRiskMLRecord[]): string {
  const headers = [
    'student_id',
    'department',
    'semester',
    'attendance_pct',
    'internal_marks_100',
    'midterm_score_50',
    'assignment_completion_pct',
    'lab_attendance_pct',
    'cumulative_backlogs',
    'prior_semester_sgpa',
    'mentor_meetings_attended',
    'parent_notified_flag',
    'risk_level',
    'dropout_probability_pct',
    'remedial_required_flag',
  ];

  const rows = data.map((r) =>
    [
      r.student_id,
      r.department,
      r.semester,
      r.attendance_pct,
      r.internal_marks_100,
      r.midterm_score_50,
      r.assignment_completion_pct,
      r.lab_attendance_pct,
      r.cumulative_backlogs,
      r.prior_semester_sgpa,
      r.mentor_meetings_attended,
      r.parent_notified_flag,
      r.risk_level,
      r.dropout_probability_pct,
      r.remedial_required_flag,
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Formats admissions records as CSV string
 */
export function formatAdmissionsForecastCsv(data: AdmissionsForecastRecord[]): string {
  const headers = [
    'record_id',
    'academic_year',
    'department',
    'applications_received',
    'available_capacity',
    'prior_year_admissions',
    'prior_year_vacancy_pct',
    'regional_placement_index',
    'industry_demand_score',
    'curriculum_revision_age_years',
    'target_admissions',
    'target_vacancy_pct',
    'target_risk_category',
  ];

  const rows = data.map((r) =>
    [
      r.record_id,
      r.academic_year,
      r.department,
      r.applications_received,
      r.available_capacity,
      r.prior_year_admissions,
      r.prior_year_vacancy_pct.toFixed(1),
      r.regional_placement_index,
      r.industry_demand_score,
      r.curriculum_revision_age_years,
      r.target_admissions,
      r.target_vacancy_pct.toFixed(1),
      r.target_risk_category,
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Formats LLM SFT samples as JSONL string
 */
export function formatLLMJsonl(samples: LLMTrainingSample[]): string {
  return samples.map((s) => JSON.stringify(s)).join('\n');
}

/**
 * n8n AI Agent Function Calling / Tool Calling JSON Schemas
 * Can be plugged directly into an n8n AI Agent node (OpenAI/Gemini/Anthropic Tool node)
 */
export interface N8nToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  sampleOutput: Record<string, any>;
}

export const N8N_TOOL_DEFINITIONS: N8nToolDefinition[] = [
  {
    name: 'get_institutional_kpis',
    description: 'Retrieves current status, YoY percentage changes, risk levels, and trends across all 5 monitored institutional KPIs (Admissions, Academic Risk, Faculty Publications, Research Funding, Faculty Work Completion).',
    parameters: {
      type: 'object',
      properties: {
        academicYear: {
          type: 'string',
          description: 'Academic cycle year, e.g., "2025-26" or "2024-25"',
        },
      },
    },
    sampleOutput: {
      admissions: { value: 3300, changeYoY: -10.81, trend: 'Declining', risk: 'MEDIUM' },
      studentAcademicRisk: { highRiskCount: 42, changeYoY: 13.51, trend: 'Increasing', risk: 'HIGH' },
      facultyPublications: { count: 184, changeYoY: -4.17, trend: 'Stable', risk: 'LOW' },
      researchFunding: { amountInr: '₹4.85 Crore', changeYoY: -11.82, trend: 'Declining', risk: 'HIGH' },
      facultyWorkCompletion: { rate: 84.6, changeYoY: -5.2, trend: 'Declining', risk: 'MEDIUM' },
    },
  },
  {
    name: 'get_high_risk_students',
    description: 'Retrieves students identified as High Academic Risk based on attendance < 60%, internal marks < 40%, and multiple backlogs.',
    parameters: {
      type: 'object',
      properties: {
        department: {
          type: 'string',
          enum: ['ALL', 'CSE', 'AIML', 'ECE', 'EEE', 'MECH'],
          description: 'Filter by engineering department or ALL',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum student dossiers to return (default: 10)',
        },
      },
    },
    sampleOutput: {
      totalHighRisk: 42,
      students: [
        {
          studentId: 'STU-2023-0104',
          name: 'Rohan Sharma',
          department: 'CSE',
          semester: 5,
          attendance: '54%',
          internalMarks: 32,
          backlogs: 4,
          reason: 'Severe attendance deficit with 4 cumulative backlogs',
          mentor: 'Dr. Ramesh Kumar',
        },
      ],
    },
  },
  {
    name: 'get_admissions_by_department',
    description: 'Returns seat capacity, applications, admitted students, conversion rate, and vacancy percentage broken down by academic department.',
    parameters: {
      type: 'object',
      properties: {
        academicYear: {
          type: 'string',
          description: 'Academic year to analyze, e.g. "2025-26"',
        },
      },
    },
    sampleOutput: {
      totalSanctioned: 4100,
      totalAdmitted: 3300,
      overallVacancyPct: 19.51,
      breakdown: [
        { department: 'CSE', capacity: 1250, admitted: 1240, vacancyPct: 0.8, risk: 'LOW' },
        { department: 'AIML', capacity: 780, admitted: 780, vacancyPct: 0.0, risk: 'LOW' },
        { department: 'ECE', capacity: 720, admitted: 570, vacancyPct: 20.8, risk: 'MEDIUM' },
        { department: 'EEE', capacity: 720, admitted: 390, vacancyPct: 45.8, risk: 'HIGH' },
        { department: 'MECH', capacity: 630, admitted: 320, vacancyPct: 49.2, risk: 'HIGH' },
      ],
    },
  },
  {
    name: 'get_research_funding_portfolio',
    description: 'Retrieves external funded grants, sponsoring agencies (DST, SERB, AICTE, DRDO, ISRO), disbursed amounts, and departmental allocations.',
    parameters: {
      type: 'object',
      properties: {
        department: {
          type: 'string',
          description: 'Department name or ALL',
        },
      },
    },
    sampleOutput: {
      totalSanctionedInr: '₹4.85 Crore',
      activeGrantsCount: 7,
      topAgencies: ['DST', 'SERB', 'AICTE', 'DRDO'],
      notableGrants: [
        { title: 'Edge Computing for Smart Grid Fault Tolerant Architectures', agency: 'DST', amount: '₹1.25 Crore', dept: 'CSE' },
      ],
    },
  },
];

/**
 * Knowledge Base Chunks (RAG) for n8n Vector Store / Semantic Search
 */
export interface RAGKnowledgeChunk {
  id: string;
  topic: string;
  category: 'Policy' | 'Risk Criteria' | 'KPI Formula' | 'Remedial Protocol';
  content: string;
}

export const RAG_INSTITUTIONAL_KNOWLEDGE_BASE: RAGKnowledgeChunk[] = [
  {
    id: 'RAG-POL-01',
    topic: 'Student Academic Risk Classification Thresholds',
    category: 'Risk Criteria',
    content: `Under university academic regulations, a student is classified into one of three risk tiers based on composite evaluation:
1. HIGH RISK: Attendance < 60% OR (Internal Marks < 40% AND Backlogs >= 3). Requires immediate parent notification, mentor counseling, and mandatory remedial tutorial enrollment.
2. MEDIUM RISK: Attendance between 60%-74% OR (Internal Marks between 40%-55% with 1-2 backlogs). Requires weekly attendance monitoring and peer tutoring.
3. LOW RISK: Attendance >= 75%, Internal Marks >= 55%, and 0 backlogs. Student is in good academic standing.`,
  },
  {
    id: 'RAG-POL-02',
    topic: 'Institutional KPI Early Warning Rules',
    category: 'KPI Formula',
    content: `The Institutional Early Warning Engine calculates risk levels using longitudinal and YoY variance thresholds:
- Admissions Risk: HIGH if YoY decline > 15% OR overall vacancy > 25%. MEDIUM if YoY decline between 5%-15% OR vacancy between 10%-25%. LOW if intake stable or growing.
- Academic Risk: HIGH if high-risk student cohort grows by > 10% YoY OR exceeds 5% of total student body.
- Research Funding: HIGH if YoY sanctioned funding declines by > 10% OR consecutive 2-year decline.
- Faculty Work Completion: HIGH if completion rate < 75% OR overdue tasks > 20. MEDIUM if completion rate 75%-85%. LOW if completion rate >= 85%.`,
  },
  {
    id: 'RAG-POL-03',
    topic: 'AI Predictive Early Warning Protocol',
    category: 'Policy',
    content: `All forward-looking statements generated by the AI agent must be framed probabilistically, never as certain facts. Standard nomenclature includes:
- 'may become high-risk if current trends continue'
- 'is estimated to experience further intake compression'
- 'early indicators warrant intervention before end-semester exams'
Institutional recommendations must distinguish between observed historical data (facts) and forward-looking extrapolations (estimates).`,
  },
  {
    id: 'RAG-POL-04',
    topic: 'Branch-Specific Remedial Interventions for Admissions Declines',
    category: 'Remedial Protocol',
    content: `When core engineering disciplines (Mechanical, Electrical, Civil) demonstrate vacancy exceeding 40%:
1. Department curriculum must embed cross-disciplinary emerging technologies (AI for Robotics, Electric Vehicle Systems, IoT Sensor Networks).
2. College Outreach Committee must launch targeted school outreach, polytechnic lateral entry seminars, and career outcome webinars.
3. Establish industry-sponsored lab clusters with placement guarantees to restore candidate demand.`,
  },
];
