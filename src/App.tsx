/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InstitutionalProvider, useInstitutional } from './context/InstitutionalContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StudentModal } from './components/common/StudentModal';
import { FacultyModal } from './components/common/FacultyModal';
import { AlertCenterDrawer } from './components/common/AlertCenterDrawer';
import { SettingsModal } from './components/common/SettingsModal';

import { DashboardView } from './views/DashboardView';
import { AdmissionsView } from './views/AdmissionsView';
import { AcademicRiskView } from './views/AcademicRiskView';
import { FacultyPublicationsView } from './views/FacultyPublicationsView';
import { ResearchFundingView } from './views/ResearchFundingView';
import { FacultyWorkView } from './views/FacultyWorkView';
import { AiAssistantView } from './views/AiAssistantView';
import { ReportsView } from './views/ReportsView';
import { DataManagementView } from './views/DataManagementView';

const MainContent: React.FC = () => {
  const { activeNavigation } = useInstitutional();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeNavigation) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Admissions':
        return <AdmissionsView />;
      case 'Academic Risk':
        return <AcademicRiskView />;
      case 'Faculty Publications':
        return <FacultyPublicationsView />;
      case 'Research Funding':
        return <ResearchFundingView />;
      case 'Faculty Work':
        return <FacultyWorkView />;
      case 'AI Assistant':
        return <AiAssistantView />;
      case 'Reports':
        return <ReportsView />;
      case 'Data Management':
        return <DataManagementView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Global Interactive Modals & Drawers */}
      <StudentModal />
      <FacultyModal />
      <AlertCenterDrawer />
      <SettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <InstitutionalProvider>
      <MainContent />
    </InstitutionalProvider>
  );
}
