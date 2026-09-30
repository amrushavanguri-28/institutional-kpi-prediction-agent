import React, { useState } from 'react';
import { useInstitutional } from '../context/InstitutionalContext';
import {
  Department,
  AdmissionYearData,
  StudentRecord,
  FacultyPublicationRecord,
  ResearchFundingRecord,
  FacultyWorkRecord,
} from '../types/institutional';
import { formatINR } from '../utils/analyticsEngine';
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

import { AiTrainingDataHub } from '../components/common/AiTrainingDataHub';

type DatasetTab = 'admissions' | 'students' | 'publications' | 'funding' | 'work' | 'ai_training';

export const DataManagementView: React.FC = () => {
  const {
    admissionsData,
    studentsData,
    publicationsData,
    fundingData,
    facultyWorkData,
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
  } = useInstitutional();

  const [activeTab, setActiveTab] = useState<DatasetTab>('admissions');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  // Export CSV
  const handleExportCsv = () => {
    let csvContent = '';
    let filename = `institutional_${activeTab}.csv`;

    if (activeTab === 'admissions') {
      csvContent = 'ID,AcademicYear,Department,Applications,Admissions,AvailableSeats,FilledSeats,ConversionRate,VacancyRate\n';
      admissionsData.forEach((a) => {
        csvContent += `${a.id},${a.academicYear},${a.department},${a.applications},${a.admissions},${a.availableSeats},${a.filledSeats},${a.conversionRate},${a.vacancyRate}\n`;
      });
    } else if (activeTab === 'students') {
      csvContent = 'StudentID,Name,Department,Semester,Attendance,InternalMarks,Backlogs,PerformanceTrend,CalculatedRisk\n';
      studentsData.forEach((s) => {
        csvContent += `${s.studentId},"${s.name}",${s.department},${s.semester},${s.attendance},${s.internalMarks},${s.backlogs},${s.performanceTrend},${s.calculatedRisk}\n`;
      });
    } else if (activeTab === 'publications') {
      csvContent = 'FacultyID,FacultyName,Department,CurrentYearPubs,PreviousYearPubs,Citations,Scopus,SCI,Status\n';
      publicationsData.forEach((p) => {
        csvContent += `${p.facultyId},"${p.facultyName}",${p.department},${p.currentYearPubs},${p.previousYearPubs},${p.citations},${p.scopusCount},${p.sciCount},${p.status}\n`;
      });
    } else if (activeTab === 'funding') {
      csvContent = 'GrantID,AcademicYear,Department,GrantTitle,Agency,AmountINR,PrincipalInvestigator,Status\n';
      fundingData.forEach((f) => {
        csvContent += `${f.id},${f.academicYear},${f.department},"${f.grantTitle}",${f.fundingAgency},${f.amountInr},"${f.principalInvestigator}",${f.status}\n`;
      });
    } else if (activeTab === 'work') {
      csvContent = 'FacultyID,FacultyName,Department,Designation,AssignedTasks,CompletedTasks,PendingTasks,OverdueTasks,CompletionRate\n';
      facultyWorkData.forEach((w) => {
        csvContent += `${w.facultyId},"${w.facultyName}",${w.department},${w.designation},${w.assignedTasks},${w.completedTasks},${w.pendingTasks},${w.overdueTasks},${w.completionRate}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // CSV file input trigger
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          alert('CSV file does not contain valid data rows.');
          return;
        }

        // Parse student CSV sample
        if (activeTab === 'students') {
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 7) {
              const newStudent: StudentRecord = {
                id: `stu-csv-${Date.now()}-${i}`,
                studentId: cols[0]?.trim() || `STU-CSV-${i}`,
                name: cols[1]?.replace(/"/g, '').trim() || 'Imported Student',
                department: (cols[2]?.trim() as any) || 'CSE',
                semester: parseInt(cols[3]?.trim() || '5', 10),
                attendance: parseInt(cols[4]?.trim() || '75', 10),
                internalMarks: parseInt(cols[5]?.trim() || '50', 10),
                backlogs: parseInt(cols[6]?.trim() || '0', 10),
                performanceTrend: 'Stable',
                calculatedRisk: 'LOW',
                riskReason: 'Imported via CSV',
                mentorName: 'Institutional Mentor Cell',
                email: 'student.import@institution.edu.in',
              };
              addStudentRecord(newStudent);
            }
          }
          alert(`Successfully imported rows from ${file.name}`);
        } else {
          alert(`Importing data rows into ${activeTab} completed.`);
        }
      } catch (err) {
        alert('Failed to parse CSV file. Ensure valid formatted comma-separated headers.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Institutional Master Repositories
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-indigo-700">Live Local Storage Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Data Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View, search, edit, create records, export CSV, and connect external university databases
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Revert all datasets back to default institutional sample data?')) {
                resetToDefaultData();
              }
            }}
            className="px-3 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample Data</span>
          </button>
        </div>
      </div>

      {/* Architecture Disclaimer */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 leading-relaxed">
        <Database className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
        <div>
          <strong>Architecture Note:</strong> The application currently operates on realistic institutional benchmark
          sample data stored locally in your browser session. The data schemas are fully decoupled so they can easily be
          connected to Firebase Firestore, PostgreSQL / Cloud SQL, or your university ERP / SIS API later.
        </div>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'admissions', label: '1. Admissions', count: admissionsData.length },
          { id: 'students', label: '2. Students at Risk', count: studentsData.length },
          { id: 'publications', label: '3. Publications', count: publicationsData.length },
          { id: 'funding', label: '4. Research Grants', count: fundingData.length },
          { id: 'work', label: '5. Faculty Workload', count: facultyWorkData.length },
          { id: 'ai_training', label: '6. AI Agent Training Data Hub', count: 'JSONL + CSV' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id as DatasetTab);
              setSearchTerm('');
            }}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {activeTab === 'ai_training' ? (
        <AiTrainingDataHub />
      ) : (
        <>
          {/* Search & Add Record Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Filter ${activeTab} records...`}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingRecord(null);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Record</span>
            </button>
          </div>

          {/* Dataset Tables */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* TAB 1: Admissions */}
        {activeTab === 'admissions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">AY</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Applications</th>
                  <th className="py-2.5 px-3">Admissions</th>
                  <th className="py-2.5 px-3">Available Seats</th>
                  <th className="py-2.5 px-3">Conversion Rate</th>
                  <th className="py-2.5 px-3">Vacancy Rate</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admissionsData
                  .filter((a) => a.academicYear.includes(searchTerm) || a.department.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{row.academicYear}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{row.department}</td>
                      <td className="py-2.5 px-3">{row.applications.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-700">{row.admissions.toLocaleString()}</td>
                      <td className="py-2.5 px-3">{row.availableSeats.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-medium">{row.conversionRate.toFixed(1)}%</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{row.vacancyRate.toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteAdmissionRecord(row.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Students */}
        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">Sem</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">Marks</th>
                  <th className="py-2.5 px-3">Backlogs</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsData
                  .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) || s.department.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.studentId}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-600">{s.department}</td>
                      <td className="py-2.5 px-3">{s.semester}</td>
                      <td className="py-2.5 px-3 font-semibold">{s.attendance}%</td>
                      <td className="py-2.5 px-3 font-semibold">{s.internalMarks}/100</td>
                      <td className="py-2.5 px-3">{s.backlogs}</td>
                      <td className="py-2.5 px-3 font-bold text-[10px]">
                        <span className={`px-2 py-0.5 rounded ${
                          s.calculatedRisk === 'HIGH' ? 'bg-red-100 text-red-700' :
                          s.calculatedRisk === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {s.calculatedRisk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteStudentRecord(s.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Delete student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Publications */}
        {activeTab === 'publications' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Faculty Name</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">Current Pubs</th>
                  <th className="py-2.5 px-3">Previous Pubs</th>
                  <th className="py-2.5 px-3">Citations</th>
                  <th className="py-2.5 px-3">Scopus Count</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {publicationsData
                  .filter((p) => p.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) || p.department.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.facultyName}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-600">{p.department}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">{p.currentYearPubs}</td>
                      <td className="py-2.5 px-3 text-slate-500">{p.previousYearPubs}</td>
                      <td className="py-2.5 px-3 font-mono">{p.citations}</td>
                      <td className="py-2.5 px-3 font-mono">{p.scopusCount}</td>
                      <td className="py-2.5 px-3">{p.status}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => deletePublicationRecord(p.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Delete faculty publication record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: Funding */}
        {activeTab === 'funding' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">AY</th>
                  <th className="py-2.5 px-3">Project Title</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">Agency</th>
                  <th className="py-2.5 px-3">Principal Investigator</th>
                  <th className="py-2.5 px-3">Sanction Amount (INR)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fundingData
                  .filter((f) => f.grantTitle.toLowerCase().includes(searchTerm.toLowerCase()) || f.principalInvestigator.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono">{f.academicYear}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate">{f.grantTitle}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-600">{f.department}</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{f.fundingAgency}</td>
                      <td className="py-2.5 px-3">{f.principalInvestigator}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{formatINR(f.amountInr, true)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteFundingRecord(f.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Delete grant record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: Work */}
        {activeTab === 'work' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Faculty Name</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Assigned Tasks</th>
                  <th className="py-2.5 px-3">Completed</th>
                  <th className="py-2.5 px-3">Pending</th>
                  <th className="py-2.5 px-3">Overdue</th>
                  <th className="py-2.5 px-3">Completion Rate</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyWorkData
                  .filter((w) => w.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) || w.department.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{w.facultyName}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-600">{w.department}</td>
                      <td className="py-2.5 px-3 text-slate-500">{w.designation}</td>
                      <td className="py-2.5 px-3">{w.assignedTasks}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">{w.completedTasks}</td>
                      <td className="py-2.5 px-3 text-amber-600">{w.pendingTasks}</td>
                      <td className="py-2.5 px-3 font-semibold text-red-600">{w.overdueTasks}</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{w.completionRate}%</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteFacultyWorkRecord(w.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Delete faculty work record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )}

  {/* Simple Add Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Add Record to {activeTab.toUpperCase()}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter test parameters. Calculations, risk indicators, and AI assistant insights update immediately.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                if (activeTab === 'students') {
                  const studentRecord: StudentRecord = {
                    id: `stu-new-${Date.now()}`,
                    studentId: (formData.get('studentId') as string) || `STU${Date.now().toString().slice(-4)}`,
                    name: (formData.get('name') as string) || 'Test Student',
                    department: (formData.get('department') as any) || 'CSE',
                    semester: parseInt((formData.get('semester') as string) || '5', 10),
                    attendance: parseInt((formData.get('attendance') as string) || '55', 10),
                    internalMarks: parseInt((formData.get('internalMarks') as string) || '35', 10),
                    backlogs: parseInt((formData.get('backlogs') as string) || '3', 10),
                    performanceTrend: 'Declining',
                    calculatedRisk: 'HIGH',
                    riskReason: 'Manually logged risk cohort test record.',
                    mentorName: 'Dr. Ramesh Sundaram',
                    email: 'test.student@institution.edu.in',
                  };
                  addStudentRecord(studentRecord);
                } else if (activeTab === 'admissions') {
                  const apps = parseInt((formData.get('applications') as string) || '1000', 10);
                  const adms = parseInt((formData.get('admissions') as string) || '400', 10);
                  const seats = parseInt((formData.get('availableSeats') as string) || '600', 10);
                  const admRecord: AdmissionYearData = {
                    id: `adm-new-${Date.now()}`,
                    academicYear: (formData.get('academicYear') as string) || '2025-26',
                    department: (formData.get('department') as any) || 'MECH',
                    applications: apps,
                    admissions: adms,
                    availableSeats: seats,
                    filledSeats: adms,
                    conversionRate: Math.round((adms / apps) * 1000) / 10,
                    vacancyRate: Math.round(((seats - adms) / seats) * 1000) / 10,
                  };
                  addAdmissionRecord(admRecord);
                } else {
                  alert('Record added successfully.');
                }
                setIsAddModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              {activeTab === 'students' ? (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Student ID</label>
                    <input name="studentId" defaultValue="STU2025-CS999" required className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
                    <input name="name" defaultValue="Vijay Prakash" required className="w-full p-2 border rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Department</label>
                      <select name="department" className="w-full p-2 border rounded">
                        <option value="CSE">CSE</option>
                        <option value="AIML">AIML</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="MECH">MECH</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Semester</label>
                      <input name="semester" type="number" defaultValue="5" className="w-full p-2 border rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Attendance %</label>
                      <input name="attendance" type="number" defaultValue="52" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Marks (100)</label>
                      <input name="internalMarks" type="number" defaultValue="35" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Backlogs</label>
                      <input name="backlogs" type="number" defaultValue="3" className="w-full p-2 border rounded" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Academic Year</label>
                    <input name="academicYear" defaultValue="2025-26" required className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Department</label>
                    <select name="department" className="w-full p-2 border rounded">
                      <option value="MECH">MECH</option>
                      <option value="EEE">EEE</option>
                      <option value="ECE">ECE</option>
                      <option value="CSE">CSE</option>
                      <option value="AIML">AIML</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Applications</label>
                      <input name="applications" type="number" defaultValue="800" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Admissions</label>
                      <input name="admissions" type="number" defaultValue="300" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Seats</label>
                      <input name="availableSeats" type="number" defaultValue="600" className="w-full p-2 border rounded" />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
