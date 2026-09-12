import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ToastContainer } from './components/layout/ToastContainer';
import { ContentModal } from './components/modals/ContentModal';
import { ContentItem } from './types';

// Views
import { DashboardView } from './views/DashboardView';
import { AnalyticsView } from './views/AnalyticsView';
import { ContentIntelligenceView } from './views/ContentIntelligenceView';
import { AudienceIntelligenceView } from './views/AudienceIntelligenceView';
import { GrowthEngineView } from './views/GrowthEngineView';
import { ExposureIntelligenceView } from './views/ExposureIntelligenceView';
import { RecommendationsView } from './views/RecommendationsView';
import { ReportsView } from './views/ReportsView';
import { DataImportView } from './views/DataImportView';
import { ImportHistoryView } from './views/ImportHistoryView';
import { DataManagementView } from './views/DataManagementView';
import { SettingsView } from './views/SettingsView';

const MainShell: React.FC = () => {
  const { activeRoute } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const renderActiveView = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <DashboardView onOpenAddModal={handleOpenAddModal} />;

      case 'analytics-overview':
        return <AnalyticsView platformFilter="all" onOpenAddModal={handleOpenAddModal} />;

      case 'analytics-youtube':
        return <AnalyticsView platformFilter="YouTube" onOpenAddModal={handleOpenAddModal} />;

      case 'analytics-instagram':
        return <AnalyticsView platformFilter="Instagram" onOpenAddModal={handleOpenAddModal} />;

      case 'analytics-tiktok':
        return <AnalyticsView platformFilter="TikTok" onOpenAddModal={handleOpenAddModal} />;

      case 'analytics-facebook':
        return <AnalyticsView platformFilter="Facebook" onOpenAddModal={handleOpenAddModal} />;

      case 'intelligence-content':
        return <ContentIntelligenceView onOpenAddModal={handleOpenAddModal} />;

      case 'intelligence-audience':
        return <AudienceIntelligenceView onOpenAddModal={handleOpenAddModal} />;

      case 'intelligence-growth':
        return <GrowthEngineView onOpenAddModal={handleOpenAddModal} />;

      case 'intelligence-exposure':
        return <ExposureIntelligenceView onOpenAddModal={handleOpenAddModal} />;

      case 'intelligence-recommendations':
        return <RecommendationsView onOpenAddModal={handleOpenAddModal} />;

      case 'reports':
        return <ReportsView onOpenAddModal={handleOpenAddModal} />;

      case 'data-import':
        return <DataImportView />;

      case 'data-history':
        return <ImportHistoryView />;

      case 'data-management':
        return (
          <DataManagementView
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
          />
        );

      case 'settings':
        return <SettingsView />;

      default:
        return <DashboardView onOpenAddModal={handleOpenAddModal} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Topbar with Global Timeline & Shortcuts */}
        <Topbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Dynamic Route View Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Add/Edit Modal */}
      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingItem}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
