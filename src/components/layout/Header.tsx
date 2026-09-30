import React, { useState, useRef, useEffect } from 'react';
import { useInstitutional } from '../../context/InstitutionalContext';
import {
  Search,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  User,
  GraduationCap,
  Building2,
  FileText,
  DollarSign,
  Briefcase,
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const {
    activeNavigation,
    setActiveNavigation,
    academicYear,
    setAcademicYear,
    globalSearchTerm,
    setGlobalSearchTerm,
    unreviewedAlertsCount,
    setIsAlertsOpen,
    setIsSettingsOpen,
    studentsData,
    facultyWorkData,
    publicationsData,
    setSelectedStudentForModal,
    setSelectedFacultyName,
  } = useInstitutional();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results across multiple domains
  const searchResults = React.useMemo(() => {
    if (!globalSearchTerm.trim()) return null;
    const q = globalSearchTerm.toLowerCase();

    const matchedStudents = studentsData
      .filter((s) => s.studentId.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q))
      .slice(0, 4);

    const matchedFaculty = facultyWorkData
      .filter((f) => f.facultyName.toLowerCase().includes(q) || f.department.toLowerCase().includes(q))
      .slice(0, 4);

    const kpiKeywords = [
      { name: 'Admissions & Intake', target: 'Admissions' },
      { name: 'Student Academic Risk', target: 'Academic Risk' },
      { name: 'Faculty Publications & Citations', target: 'Faculty Publications' },
      { name: 'Research Funding & Grants', target: 'Research Funding' },
      { name: 'Faculty Work Completion', target: 'Faculty Work' },
    ].filter((k) => k.name.toLowerCase().includes(q));

    return {
      students: matchedStudents,
      faculty: matchedFaculty,
      kpis: kpiKeywords,
      total: matchedStudents.length + matchedFaculty.length + kpiKeywords.length,
    };
  }, [globalSearchTerm, studentsData, facultyWorkData]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {activeNavigation}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 rounded border border-indigo-100">
                Institutional Analytics
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search with multi-domain instant autocomplete */}
        <div className="flex-1 max-w-md mx-4 relative" ref={searchContainerRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search Student ID, Faculty, Dept (CSE, AIML), or KPI..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
            />
            {globalSearchTerm && (
              <button
                type="button"
                onClick={() => setGlobalSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchResults && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto divide-y divide-slate-100">
              {searchResults.total === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No institutional records found matching &ldquo;{globalSearchTerm}&rdquo;
                </div>
              ) : (
                <>
                  {searchResults.kpis.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                        Analytics Modules
                      </div>
                      {searchResults.kpis.map((kpi) => (
                        <button
                          key={kpi.target}
                          type="button"
                          onClick={() => {
                            setActiveNavigation(kpi.target);
                            setIsSearchFocused(false);
                            setGlobalSearchTerm('');
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                        >
                          <span className="font-medium">{kpi.name}</span>
                          <span className="text-[11px] text-indigo-600">Jump to module →</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.students.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                        Students ({searchResults.students.length})
                      </div>
                      {searchResults.students.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudentForModal(student);
                            setActiveNavigation('Academic Risk');
                            setIsSearchFocused(false);
                            setGlobalSearchTerm('');
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{student.name}</span>
                            <span className="text-slate-400 ml-2">({student.studentId} • {student.department})</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            student.calculatedRisk === 'HIGH' ? 'bg-red-100 text-red-700' :
                            student.calculatedRisk === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {student.calculatedRisk} RISK
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.faculty.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                        Faculty Members ({searchResults.faculty.length})
                      </div>
                      {searchResults.faculty.map((fac) => (
                        <button
                          key={fac.id}
                          type="button"
                          onClick={() => {
                            setSelectedFacultyName(fac.facultyName);
                            setActiveNavigation('Faculty Work');
                            setIsSearchFocused(false);
                            setGlobalSearchTerm('');
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{fac.facultyName}</span>
                            <span className="text-slate-400 ml-2">({fac.department} • {fac.designation})</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {fac.completionRate}% completion
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Academic Year Selector, Alerts, Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Academic Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs">
            <span className="text-slate-500 hidden lg:inline font-medium">Academic Year:</span>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="2025-26">AY 2025-26 (Current)</option>
              <option value="2024-25">AY 2024-25</option>
              <option value="2023-24">AY 2023-24</option>
              <option value="2022-23">AY 2022-23</option>
            </select>
          </div>

          {/* Alert Center Trigger */}
          <button
            type="button"
            onClick={() => setIsAlertsOpen(true)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Institutional Alert Center"
            aria-label="Alerts"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreviewedAlertsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                {unreviewedAlertsCount}
              </span>
            )}
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Institutional Configuration"
            aria-label="Settings"
          >
            <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Academic Dean / Admin Profile */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-300">
              DA
            </div>
            <div className="text-left hidden xl:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Dean of Academic Affairs
              </div>
              <div className="text-[10px] text-slate-500">Office of Institutional Planning</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
