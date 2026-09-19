import React, { useState } from 'react';
import { AMLProvider, useAML } from './context/AMLContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { JudgeDemoBanner } from './components/common/JudgeDemoBanner';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { CsvImportModal } from './components/csv/CsvImportModal';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { TransactionMonitorView } from './views/TransactionMonitorView';
import { MoneyNetworkView } from './views/MoneyNetworkView';
import { SuspiciousCasesView } from './views/SuspiciousCasesView';
import { InvestigationWorkspaceView } from './views/InvestigationWorkspaceView';
import { AIInvestigatorView } from './views/AIInvestigatorView';
import { CaseReportView } from './views/CaseReportView';
import { DemoScenarioView } from './views/DemoScenarioView';
import { SettingsView } from './views/SettingsView';

const AMLensAppContent: React.FC = () => {
  const { currentUser, activeView } = useAML();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // If user is not logged in, show Login view
  if (!currentUser) {
    return <LoginView />;
  }

  // Render current view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionMonitorView />;
      case 'network':
        return <MoneyNetworkView />;
      case 'cases':
        return <SuspiciousCasesView />;
      case 'investigation':
        return <InvestigationWorkspaceView />;
      case 'ai_investigator':
        return <AIInvestigatorView />;
      case 'case_reports':
        return <CaseReportView />;
      case 'demo_scenarios':
        return <DemoScenarioView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div id="amlens-app-root" className="min-h-screen bg-slate-100/70 flex flex-col antialiased text-slate-900">
      {/* Judge Demo Banner */}
      <JudgeDemoBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Header */}
          <Header
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            onOpenCsvModal={() => setIsCsvModalOpen(true)}
          />

          {/* View Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderView()}
          </main>
        </div>
      </div>

      {/* Modals & Portals */}
      <GlobalSearchModal />
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AMLProvider>
      <AMLensAppContent />
    </AMLProvider>
  );
}
