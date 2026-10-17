import React, { useState } from 'react';
import { OpsProvider } from './context/OpsContext';
import { Header } from './components/Header';
import { SimulationBar } from './components/SimulationBar';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { WorkItemList } from './components/WorkItemList';
import { WorkItemDetail } from './components/WorkItemDetail';
import { ConcurrencyConflictModal } from './components/ConcurrencyConflictModal';
import { CreateWorkItemModal } from './components/CreateWorkItemModal';
import { ToastContainer } from './components/ToastContainer';

function DashboardContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Global Navigation & RBAC Switcher */}
      <Header onOpenCreateModal={() => setIsCreateOpen(true)} />

      {/* 2. Interactive Critical Behavior Lab (Evaluator Simulator) */}
      <SimulationBar />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        
        {/* KPI Triage Overview */}
        <StatsOverview />

        {/* Search, Status & Priority Filter Bar */}
        <FilterBar />

        {/* Two-Column Operations Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Work Items Queue (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <WorkItemList />
          </div>

          {/* Right Column: Deep-Dive Item Detail & Audit Trail (7 cols) */}
          <div className="lg:col-span-7 sticky top-20">
            <WorkItemDetail />
          </div>

        </div>
      </main>

      {/* Modals & Notifications */}
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
