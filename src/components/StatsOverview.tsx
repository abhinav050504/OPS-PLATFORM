import React from 'react';
import { useOps } from '../context/OpsContext';
import { 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Flame, 
  UserCheck 
} from 'lucide-react';

export const StatsOverview: React.FC = () => {
  const { workItems, selectedTeam, currentUser, setStatusFilter, setPriorityFilter } = useOps();

  // Filter based on selected team if applicable
  const filtered = selectedTeam === 'All Teams' 
    ? workItems 
    : workItems.filter((w) => w.team === selectedTeam);

  const criticalCount = filtered.filter((w) => w.priority === 'P0_CRITICAL' && w.status !== 'RESOLVED').length;
  const pendingApprovalsCount = filtered.filter((w) => w.requiresApproval && w.approvalStatus === 'PENDING').length;
  const myAssignedCount = filtered.filter((w) => w.assignee?.id === currentUser.id && w.status !== 'RESOLVED').length;
  const triageCount = filtered.filter((w) => w.status === 'TRIAGE' || !w.assignee).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      
      {/* 1. Critical & Escalations */}
      <div 
        onClick={() => { setPriorityFilter('P0_CRITICAL'); setStatusFilter('ALL'); }}
        className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-3.5 hover:border-rose-500/60 cursor-pointer transition shadow-lg shadow-rose-950/20 group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-rose-400 uppercase">
            P0 Critical Incidents
          </span>
          <Flame className="w-4 h-4 text-rose-500 group-hover:scale-110 transition" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{criticalCount}</span>
          <span className="text-[11px] text-rose-300 font-medium">Requires triage</span>
        </div>
      </div>

      {/* 2. Pending Approvals */}
      <div 
        onClick={() => { setStatusFilter('PENDING_APPROVAL'); setPriorityFilter('ALL'); }}
        className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 hover:border-amber-500/60 cursor-pointer transition shadow-lg shadow-amber-950/20 group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
            Pending Approvals
          </span>
          <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{pendingApprovalsCount}</span>
          <span className="text-[11px] text-amber-300 font-medium">Blocking execution</span>
        </div>
      </div>

      {/* 3. My Responsibilities */}
      <div 
        onClick={() => { setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
        className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-3.5 hover:border-indigo-500/60 cursor-pointer transition shadow-lg shadow-indigo-950/20 group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-indigo-400 uppercase">
            Assigned to Me
          </span>
          <UserCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{myAssignedCount}</span>
          <span className="text-[11px] text-indigo-300 font-medium">{currentUser.name.split(' ')[0]}'s active</span>
        </div>
      </div>

      {/* 4. Unassigned / Needs Triage */}
      <div 
        onClick={() => { setStatusFilter('TRIAGE'); setPriorityFilter('ALL'); }}
        className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3.5 hover:border-cyan-500/60 cursor-pointer transition shadow-lg shadow-cyan-950/20 group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-cyan-400 uppercase">
            Unassigned Triage
          </span>
          <AlertOctagon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{triageCount}</span>
          <span className="text-[11px] text-cyan-300 font-medium">Needs owner</span>
        </div>
      </div>

    </div>
  );
};
