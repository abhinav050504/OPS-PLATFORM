import React, { useState } from 'react';
import { OpsProvider, useOps } from './context/OpsContext';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { QueuePage } from './pages/QueuePage';
import { DetailPage } from './pages/DetailPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ConcurrencyLabPage } from './pages/ConcurrencyLabPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { ConcurrencyConflictModal } from './components/ConcurrencyConflictModal';
import { CreateWorkItemModal } from './components/CreateWorkItemModal';
import { ToastContainer } from './components/ToastContainer';

function DashboardContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { activePage } = useOps();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Global Navigation Bar */}
      <Header onOpenCreateModal={() => setIsCreateOpen(true)} />

      {/* 2. Section Navigation Tabs */}
      <NavigationTabs />

      {/* 3. Spacious Page Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activePage === 'QUEUE' && <QueuePage />}
        {activePage === 'DETAIL' && <DetailPage />}
        {activePage === 'APPROVALS' && <ApprovalsPage />}
        {activePage === 'LAB' && <ConcurrencyLabPage />}
        {activePage === 'AUDIT' && <AuditLogPage />}
      </main>

      {/* Global Modals & Notifications */}
      <CreateWorkItemModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ConcurrencyConflictModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <OpsProvider>
      <DashboardContent />
    </OpsProvider>
  );
}
