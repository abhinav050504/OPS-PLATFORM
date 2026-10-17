import React from 'react';
import { useOps } from '../context/OpsContext';
import { Flame, Clock, UserCheck, AlertOctagon } from 'lucide-react';

export const StatsOverview: React.FC = () => {
  const { workItems, selectedTeam, currentUser, setStatusFilter, setPriorityFilter } = useOps();

  const filtered = selectedTeam === 'All Teams' 
    ? workItems 
    : workItems.filter((w) => w.team === selectedTeam);

  const criticalCount = filtered.filter((w) => w.priority === 'P0_CRITICAL' && w.status !== 'RESOLVED').length;
  const pendingApprovalsCount = filtered.filter((w) => w.requiresApproval && w.approvalStatus === 'PENDING').length;
  const myAssignedCount = filtered.filter((w) => w.assignee?.id === currentUser.id && w.status !== 'RESOLVED').length;
  const triageCount = filtered.filter((w) => w.status === 'TRIAGE' || !w.assignee).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      
      {/* 1. Critical */}
      <div 
        onClick={() => { setPriorityFilter('P0_CRITICAL'); setStatusFilter('ALL'); }}
        className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 cursor-pointer transition shadow-xs group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            P0 Critical Incidents
          </span>
          <Flame className="w-4 h-4 text-rose-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{criticalCount}</span>
          <span className="text-[11px] text-rose-600 font-medium">Requires triage</span>
        </div>
      </div>

      {/* 2. Pending Approvals */}
      <div 
        onClick={() => { setStatusFilter('PENDING_APPROVAL'); setPriorityFilter('ALL'); }}
        className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 cursor-pointer transition shadow-xs group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Pending Approvals
          </span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{pendingApprovalsCount}</span>
          <span className="text-[11px] text-amber-600 font-medium">Blocking execution</span>
        </div>
      </div>

      {/* 3. My Responsibilities */}
      <div 
        onClick={() => { setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
        className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 cursor-pointer transition shadow-xs group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Assigned to Me
          </span>
          <UserCheck className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{myAssignedCount}</span>
          <span className="text-[11px] text-indigo-600 font-medium">{currentUser.name.split(' ')[0]}'s active</span>
        </div>
      </div>

      {/* 4. Unassigned / Needs Triage */}
      <div 
        onClick={() => { setStatusFilter('TRIAGE'); setPriorityFilter('ALL'); }}
        className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 cursor-pointer transition shadow-xs group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Unassigned / Triage
          </span>
          <AlertOctagon className="w-4 h-4 text-sky-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{triageCount}</span>
          <span className="text-[11px] text-sky-600 font-medium">Needs owner</span>
        </div>
      </div>

    </div>
  );
};
