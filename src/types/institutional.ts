export type Department = 'CSE' | 'AIML' | 'ECE' | 'EEE' | 'MECH';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TrendDirection = 'Increasing' | 'Stable' | 'Declining';

export interface AdmissionYearData {
  id: string;
  academicYear: string;
  department: Department | 'ALL';
  applications: number;
  admissions: number;
  availableSeats: number;
  filledSeats: number;
  conversionRate: number; // (admissions / applications) * 100
  vacancyRate: number;    // ((availableSeats - filledSeats) / availableSeats) * 100
}

export interface StudentRecord {
  id: string;
  studentId: string;
  name: string;
  department: Department;
  semester: number;
  attendance: number;       // percentage (0-100)
  internalMarks: number;    // out of 100
  backlogs: number;         // count
  performanceTrend: TrendDirection;
  calculatedRisk: RiskLevel;
  riskReason: string;
  mentorName: string;
  mentorNotes?: string;
  email: string;
}

export interface FacultyPublicationRecord {
  id: string;
  facultyId: string;
  facultyName: string;
  department: Department;
  currentYearPubs: number;
  previousYearPubs: number;
  citations: number;
  scopusCount: number;
  sciCount: number;
  conferenceCount: number;
  changePercent: number;
  trend: TrendDirection;
  status: 'Active' | 'Low Activity' | 'Exceeding Target';
}

export interface ResearchFundingRecord {
  id: string;
  academicYear: string;
  department: Department;
  grantTitle: string;
  fundingAgency: 'DST' | 'SERB' | 'AICTE' | 'DRDO' | 'Industry' | 'ISRO';
  amountInr: number;
  previousAmountInr: number;
  principalInvestigator: string;
  sanctionYear: string;
  status: 'Sanctioned' | 'Disbursed' | 'Utilization in Progress';
}

export interface FacultyWorkRecord {
  id: string;
  facultyId: string;
  facultyName: string;
  department: Department;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'HOD';
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number; // percentage
  status: 'High Performance' | 'Normal' | 'Needs Follow-up' | 'Critical Delay';
}

export interface CalculatedKpi {
  id: 'admissions' | 'academic_risk' | 'publications' | 'research_funding' | 'faculty_work';
  title: string;
  currentValue: number;
  previousValue: number;
  formattedCurrent: string;
  formattedPrevious: string;
  percentageChange: number;
  trend: TrendDirection;
  riskLevel: RiskLevel;
  riskReason: string;
  summaryNote: string;
}

export interface EmergingRiskPrediction {
  id: string;
  kpiId: string;
  kpiTitle: string;
  currentStatus: string;
  historicalTrend: TrendDirection;
  currentChange: string;
  estimatedFutureDirection: string;
  riskLevel: RiskLevel;
  confidenceScore: number; // e.g. 87%
  reason: string;
  intervention: string;
}

export interface InstitutionalAlert {
  id: string;
  timestamp: string;
  kpiId: string;
  kpiName: string;
  title: string;
  message: string;
  severity: RiskLevel;
  reviewed: boolean;
  navTarget: string;
}

export interface HistoricalYearSummary {
  year: string;
  admissions: number;
  highRiskStudents: number;
  publications: number;
  researchFundingInr: number;
  workCompletionRate: number;
}
