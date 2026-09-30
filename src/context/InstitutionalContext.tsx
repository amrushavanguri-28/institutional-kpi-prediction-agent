import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AdmissionYearData,
  StudentRecord,
  FacultyPublicationRecord,
  ResearchFundingRecord,
  FacultyWorkRecord,
  HistoricalYearSummary,
  CalculatedKpi,
  EmergingRiskPrediction,
  InstitutionalAlert,
} from '../types/institutional';
import {
  DEFAULT_ADMISSIONS_DATA,
  DEFAULT_STUDENTS_DATA,
  DEFAULT_FACULTY_PUBLICATIONS,
  DEFAULT_RESEARCH_FUNDING,
  DEFAULT_FACULTY_WORK,
  HISTORICAL_ANNUAL_DATA,
} from '../data/defaultData';
import {
  computeAllInstitutionalKpis,
  generateCurrentSituationNarrative,
  generateEmergingRiskPredictions,
  generateInstitutionalAlerts,
  calculateStudentRisk,
  calculateFacultyRisk,
} from '../utils/analyticsEngine';

interface InstitutionalContextType {
  // Datasets
  admissionsData: AdmissionYearData[];
  studentsData: StudentRecord[];
  publicationsData: FacultyPublicationRecord[];
  fundingData: ResearchFundingRecord[];
  facultyWorkData: FacultyWorkRecord[];
  historicalData: HistoricalYearSummary[];

  // App Navigation & Controls
  activeNavigation: string;
  setActiveNavigation: (nav: string) => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;

  // Alerts
  alerts: InstitutionalAlert[];
  markAlertReviewed: (id: string) => void;
  markAllAlertsReviewed: () => void;
  unreviewedAlertsCount: number;

  // Computed Intelligence
  calculatedKpis: CalculatedKpi[];
  currentSituationNarrative: string[];
  emergingRisks: EmergingRiskPrediction[];

  // Modals & Drawers
  selectedStudentForModal: StudentRecord | null;
  setSelectedStudentForModal: (student: StudentRecord | null) => void;
  selectedFacultyName: string | null;
  setSelectedFacultyName: (name: string | null) => void;
  isAlertsOpen: boolean;
  setIsAlertsOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // CRUD Operations
  addAdmissionRecord: (record: AdmissionYearData) => void;
  updateAdmissionRecord: (record: AdmissionYearData) => void;
  deleteAdmissionRecord: (id: string) => void;

  addStudentRecord: (record: StudentRecord) => void;
  updateStudentRecord: (record: StudentRecord) => void;
  deleteStudentRecord: (id: string) => void;

  addPublicationRecord: (record: FacultyPublicationRecord) => void;
  updatePublicationRecord: (record: FacultyPublicationRecord) => void;
  deletePublicationRecord: (id: string) => void;

  addFundingRecord: (record: ResearchFundingRecord) => void;
  updateFundingRecord: (record: ResearchFundingRecord) => void;
  deleteFundingRecord: (id: string) => void;

  addFacultyWorkRecord: (record: FacultyWorkRecord) => void;
  updateFacultyWorkRecord: (record: FacultyWorkRecord) => void;
  deleteFacultyWorkRecord: (id: string) => void;

  resetToDefaultData: () => void;
}

const InstitutionalContext = createContext<InstitutionalContextType | undefined>(undefined);

export const InstitutionalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeNavigation, setActiveNavigation] = useState<string>('Dashboard');
  const [academicYear, setAcademicYear] = useState<string>('2025-26');
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');

  // Modals
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentRecord | null>(null);
  const [selectedFacultyName, setSelectedFacultyName] = useState<string | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Load datasets from localStorage or default
  const [admissionsData, setAdmissionsData] = useState<AdmissionYearData[]>(() => {
    try {
      const saved = localStorage.getItem('kpi_admissions');
      return saved ? JSON.parse(saved) : DEFAULT_ADMISSIONS_DATA;
    } catch {
      return DEFAULT_ADMISSIONS_DATA;
    }
  });

  const [studentsData, setStudentsData] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('kpi_students');
      if (saved) return JSON.parse(saved);
      // Auto-calculate risk on initial load
      return DEFAULT_STUDENTS_DATA.map((s) => {
        const risk = calculateStudentRisk(s);
        return { ...s, calculatedRisk: risk.riskLevel, riskReason: risk.reason };
      });
    } catch {
      return DEFAULT_STUDENTS_DATA;
    }
  });

  const [publicationsData, setPublicationsData] = useState<FacultyPublicationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('kpi_publications');
      return saved ? JSON.parse(saved) : DEFAULT_FACULTY_PUBLICATIONS;
    } catch {
      return DEFAULT_FACULTY_PUBLICATIONS;
    }
  });

  const [fundingData, setFundingData] = useState<ResearchFundingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('kpi_funding');
      return saved ? JSON.parse(saved) : DEFAULT_RESEARCH_FUNDING;
    } catch {
      return DEFAULT_RESEARCH_FUNDING;
    }
  });

  const [facultyWorkData, setFacultyWorkData] = useState<FacultyWorkRecord[]>(() => {
    try {
      const saved = localStorage.getItem('kpi_faculty_work');
      return saved ? JSON.parse(saved) : DEFAULT_FACULTY_WORK;
    } catch {
      return DEFAULT_FACULTY_WORK;
    }
  });

  const historicalData = HISTORICAL_ANNUAL_DATA;

  // Persist datasets to localStorage when modified
  useEffect(() => {
    localStorage.setItem('kpi_admissions', JSON.stringify(admissionsData));
  }, [admissionsData]);

  useEffect(() => {
    localStorage.setItem('kpi_students', JSON.stringify(studentsData));
  }, [studentsData]);

  useEffect(() => {
    localStorage.setItem('kpi_publications', JSON.stringify(publicationsData));
  }, [publicationsData]);

  useEffect(() => {
    localStorage.setItem('kpi_funding', JSON.stringify(fundingData));
  }, [fundingData]);

  useEffect(() => {
    localStorage.setItem('kpi_faculty_work', JSON.stringify(facultyWorkData));
  }, [facultyWorkData]);

  // Compute Master KPIs dynamically
  const calculatedKpis = useMemo(() => {
    return computeAllInstitutionalKpis(
      admissionsData,
      studentsData,
      publicationsData,
      fundingData,
      facultyWorkData,
      academicYear
    );
  }, [admissionsData, studentsData, publicationsData, fundingData, facultyWorkData, academicYear]);

  // Compute Current Situation narrative dynamically
  const currentSituationNarrative = useMemo(() => {
    return generateCurrentSituationNarrative(calculatedKpis);
  }, [calculatedKpis]);

  // Compute Emerging Risk Predictions dynamically
  const emergingRisks = useMemo(() => {
    return generateEmergingRiskPredictions(calculatedKpis);
  }, [calculatedKpis]);

  // Dynamic alerts
  const [alerts, setAlerts] = useState<InstitutionalAlert[]>(() => {
    return generateInstitutionalAlerts(calculatedKpis, studentsData);
  });

  // Re-generate alerts whenever computed KPIs or students change
  useEffect(() => {
    const freshAlerts = generateInstitutionalAlerts(calculatedKpis, studentsData);
    setAlerts((prev) => {
      // Preserve reviewed status for existing alert IDs
      const reviewedMap = new Map(prev.map((a) => [a.id, a.reviewed]));
      return freshAlerts.map((a) => ({
        ...a,
        reviewed: reviewedMap.get(a.id) ?? a.reviewed,
      }));
    });
  }, [calculatedKpis, studentsData]);

  const markAlertReviewed = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, reviewed: true } : a)));
  };

  const markAllAlertsReviewed = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, reviewed: true })));
  };

  const unreviewedAlertsCount = useMemo(() => {
    return alerts.filter((a) => !a.reviewed).length;
  }, [alerts]);

  // CRUD for Admissions
  const addAdmissionRecord = (record: AdmissionYearData) => {
    setAdmissionsData((prev) => [record, ...prev]);
  };
  const updateAdmissionRecord = (record: AdmissionYearData) => {
    setAdmissionsData((prev) => prev.map((r) => (r.id === record.id ? record : r)));
  };
  const deleteAdmissionRecord = (id: string) => {
    setAdmissionsData((prev) => prev.filter((r) => r.id !== id));
  };

  // CRUD for Students
  const addStudentRecord = (record: StudentRecord) => {
    const risk = calculateStudentRisk(record);
    const enriched = { ...record, calculatedRisk: risk.riskLevel, riskReason: risk.reason };
    setStudentsData((prev) => [enriched, ...prev]);
  };
  const updateStudentRecord = (record: StudentRecord) => {
    const risk = calculateStudentRisk(record);
    const enriched = { ...record, calculatedRisk: risk.riskLevel, riskReason: risk.reason };
    setStudentsData((prev) => prev.map((r) => (r.id === record.id ? enriched : r)));
  };
  const deleteStudentRecord = (id: string) => {
    setStudentsData((prev) => prev.filter((r) => r.id !== id));
  };

  // CRUD for Publications
  const addPublicationRecord = (record: FacultyPublicationRecord) => {
    setPublicationsData((prev) => [record, ...prev]);
  };
  const updatePublicationRecord = (record: FacultyPublicationRecord) => {
    setPublicationsData((prev) => prev.map((r) => (r.id === record.id ? record : r)));
  };
  const deletePublicationRecord = (id: string) => {
    setPublicationsData((prev) => prev.filter((r) => r.id !== id));
  };

  // CRUD for Research Funding
  const addFundingRecord = (record: ResearchFundingRecord) => {
    setFundingData((prev) => [record, ...prev]);
  };
  const updateFundingRecord = (record: ResearchFundingRecord) => {
    setFundingData((prev) => prev.map((r) => (r.id === record.id ? record : r)));
  };
  const deleteFundingRecord = (id: string) => {
    setFundingData((prev) => prev.filter((r) => r.id !== id));
  };

  // CRUD for Faculty Work
  const addFacultyWorkRecord = (record: FacultyWorkRecord) => {
    const rate = record.assignedTasks > 0 ? (record.completedTasks / record.assignedTasks) * 100 : 0;
    const { status } = calculateFacultyRisk(rate);
    const enriched = { ...record, completionRate: Math.round(rate * 10) / 10, status: status as any };
    setFacultyWorkData((prev) => [enriched, ...prev]);
  };
  const updateFacultyWorkRecord = (record: FacultyWorkRecord) => {
    const rate = record.assignedTasks > 0 ? (record.completedTasks / record.assignedTasks) * 100 : 0;
    const { status } = calculateFacultyRisk(rate);
    const enriched = { ...record, completionRate: Math.round(rate * 10) / 10, status: status as any };
    setFacultyWorkData((prev) => prev.map((r) => (r.id === record.id ? enriched : r)));
  };
  const deleteFacultyWorkRecord = (id: string) => {
    setFacultyWorkData((prev) => prev.filter((r) => r.id !== id));
  };

  // Reset to default
  const resetToDefaultData = () => {
    setAdmissionsData(DEFAULT_ADMISSIONS_DATA);
    const enrichedStudents = DEFAULT_STUDENTS_DATA.map((s) => {
      const risk = calculateStudentRisk(s);
      return { ...s, calculatedRisk: risk.riskLevel, riskReason: risk.reason };
    });
    setStudentsData(enrichedStudents);
    setPublicationsData(DEFAULT_FACULTY_PUBLICATIONS);
    setFundingData(DEFAULT_RESEARCH_FUNDING);
    setFacultyWorkData(DEFAULT_FACULTY_WORK);
    setAlerts(generateInstitutionalAlerts(DEFAULT_ADMISSIONS_DATA as any, enrichedStudents));
    localStorage.clear();
  };

  return (
    <InstitutionalContext.Provider
      value={{
        admissionsData,
        studentsData,
        publicationsData,
        fundingData,
        facultyWorkData,
        historicalData,
        activeNavigation,
        setActiveNavigation,
        academicYear,
        setAcademicYear,
        globalSearchTerm,
        setGlobalSearchTerm,
        alerts,
        markAlertReviewed,
        markAllAlertsReviewed,
        unreviewedAlertsCount,
        calculatedKpis,
        currentSituationNarrative,
        emergingRisks,
        selectedStudentForModal,
        setSelectedStudentForModal,
        selectedFacultyName,
        setSelectedFacultyName,
        isAlertsOpen,
        setIsAlertsOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        addAdmissionRecord,
        updateAdmissionRecord,
        deleteAdmissionRecord,
        addStudentRecord,
        updateStudentRecord,
        deleteStudentRecord,
        addPublicationRecord,
        updatePublicationRecord,
        deletePublicationRecord,
        addFundingRecord,
        updateFundingRecord,
        deleteFundingRecord,
        addFacultyWorkRecord,
        updateFacultyWorkRecord,
        deleteFacultyWorkRecord,
        resetToDefaultData,
      }}
    >
      {children}
    </InstitutionalContext.Provider>
  );
};

export const useInstitutional = () => {
  const context = useContext(InstitutionalContext);
  if (!context) {
    throw new Error('useInstitutional must be used within an InstitutionalProvider');
  }
  return context;
};
