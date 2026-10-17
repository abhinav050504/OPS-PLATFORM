import React from 'react';
import { useOps } from '../context/OpsContext';
import { WorkItem, WorkItemPriority, WorkItemStatus } from '../types/ops';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Flame, 
  HelpCircle, 
  Lock, 
  Eye, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const WorkItemList: React.FC = () => {
  const {
    workItems,
    selectedItem,
    setSelectedItem,
    selectedTeam,
    statusFilter,
    priorityFilter,
    searchQuery,
    currentUser,
    claimWorkItem,
  } = useOps();

  const getPriorityBadge = (p: WorkItemPriority) => {
    switch (p) {
      case 'P0_CRITICAL':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <Flame className="w-3 h-3 text-rose-400 fill-rose-400" /> P0 CRITICAL
          </span>
        );
      case 'P1_HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            P1 HIGH
          </span>
        );
      case 'P2_MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            P2 MEDIUM
          </span>
        );
      case 'P3_LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            P3 LOW
          </span>
        );
    }
  };

  const getStatusBadge = (s: WorkItemStatus) => {
    switch (s) {
      case 'TRIAGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">TRIAGE</span>;
      case 'INVESTIGATING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">INVESTIGATING</span>;
      case 'PENDING_APPROVAL':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Lock className="w-2.5 h-2.5" /> PENDING APPROVAL
          </span>
        );
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">IN PROGRESS</span>;
      case 'RESOLVED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-2.5 h-2.5" /> RESOLVED
          </span>
        );
      case 'BLOCKED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">BLOCKED</span>;
    }
  };

  // Filter application
  const filteredItems = workItems.filter((item) => {
    if (selectedTeam !== 'All Teams' && item.team !== selectedTeam) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchContext = item.context.toLowerCase().includes(q);
      const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchId && !matchTitle && !matchContext && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs px-1 text-slate-400 font-medium">
        <span>Showing {filteredItems.length} operational work items</span>
        <span className="text-[11px] font-mono text-slate-500">Sorted by SLA & Priority</span>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center">
          <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-300 font-medium text-sm">No operational work items found</p>
          <p className="text-slate-500 text-xs mt-1">Try resetting filters or changing the active team</p>
        </div>
      ) : (
        filteredItems.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          const isAssignedToMe = item.assignee?.id === currentUser.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800/95 border-indigo-500/80 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/70 border-slate-800/90 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                
                {/* Left: ID + Category + Title */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-indigo-400">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700/50">
                      {item.team}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      v{item.version}
                    </span>
                    {item.activeCollaborators.length > 1 && (
                      <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        <Eye className="w-3 h-3" />
                        {item.activeCollaborators.length} viewing
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 truncate hover:text-indigo-300 transition">
                    {item.title}
                  </h3>

                  {/* Immediate Next Action Banner */}
                  <div className="flex items-center gap-1.5 text-xs text-amber-300/90 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
                    <span className="font-semibold text-[10px] uppercase tracking-wider text-amber-400">Next Action:</span>
                    <span className="truncate text-[11px]">{item.nextActionRequired}</span>
                  </div>
                </div>

                {/* Right: Priority & Status Badges */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {getPriorityBadge(item.priority)}
                  {getStatusBadge(item.status)}
                </div>

              </div>

              {/* Bottom Meta Row */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
                
                {/* Assignee */}
                <div className="flex items-center gap-2">
                  {item.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <img
                        src={item.assignee.avatar}
                        alt={item.assignee.name}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      <span className={`text-xs ${isAssignedToMe ? 'text-indigo-300 font-medium' : 'text-slate-300'}`}>
                        {item.assignee.name} {isAssignedToMe && '(You)'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        claimWorkItem(item.id);
                      }}
                      className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-semibold border border-indigo-500/40 transition"
                    >
                      + Take Ownership
                    </button>
                  )}
                </div>

                {/* SLA / Last Modified */}
                <div className="flex items-center gap-3 text-[11px]">
                  {item.slaExpiresAt && (
                    <span className="flex items-center gap-1 text-rose-300/90 font-medium">
                      <Clock className="w-3 h-3 text-rose-400" />
                      SLA: {item.slaExpiresAt}
                    </span>
                  )}
                  <span className="text-slate-500">
                    Updated {item.lastModifiedAt} by {item.lastModifiedBy}
                  </span>
                </div>

              </div>

            </div>
          );
        })
      )}
    </div>
  );
};
