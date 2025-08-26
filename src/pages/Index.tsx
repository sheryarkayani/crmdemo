import React from 'react';
import { BoardProvider, useBoardContext } from '@/context/BoardContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import TableView from '@/components/views/TableView';
import KanbanView from '@/components/views/KanbanView';
import DashboardView from '@/components/views/DashboardView';
import GanttView from '@/components/views/GanttView';
import ErrorBoundary from '@/components/ErrorBoundary';

const MainContent = () => {
  const { currentView } = useBoardContext();

  const renderView = () => {
    switch (currentView) {
      case 'table':
        return <TableView />;
      case 'kanban':
        return <KanbanView />;
      case 'dashboard':
        return <DashboardView />;
      case 'gantt':
        return <GanttView />;
      default:
        return <TableView />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 dark:from-slate-900 dark:via-red-950/30 dark:to-orange-950/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">
          <ErrorBoundary>
            {renderView()}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <BoardProvider>
      <MainContent />
    </BoardProvider>
  );
};

export default Index;
