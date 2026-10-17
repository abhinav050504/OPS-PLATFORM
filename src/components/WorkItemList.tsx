import React from 'react';
import { useOps } from '../context/OpsContext';
import { WorkItemPriority, WorkItemStatus } from '../types/ops';
import { Clock, Eye, HelpCircle, CheckCircle, Lock } from 'lucide-react';

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
    setActivePage,
  } = useOps();

  const getPriorityBadge = (p: WorkItemPriority) => {
    switch (p) {
      case 'P0_CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
            P0 CRITICAL
          </span>
        );
      case 'P1_HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            P1 HIGH
          </span>
        );
      case 'P2_MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            P2 MEDIUM
          </span>
        );
      case 'P3_LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            P3 LOW
          </span>
        );
    }
  };

  const getStatusBadge = (s: WorkItemStatus) => {
    switch (s) {
      case 'TRIAGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">Triage</span>;
      case 'INVESTIGATING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Investigating</span>;
      case 'PENDING_APPROVAL':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Lock className="w-2.5 h-2.5" /> Approval Req
          </span>
        );
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">In Progress</span>;
      case 'RESOLVED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-2.5 h-2.5" /> Resolved
          </span>
        );
      case 'BLOCKED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Blocked</span>;
    }
  };

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
      <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-medium">
        <span>Showing {filteredItems.length} operational work items</span>
        <span className="text-[11px] font-mono text-slate-400">Sorted by SLA & Priority</span>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-800 font-semibold text-sm">No operational work items found</p>
          <p className="text-slate-500 text-xs mt-1">Try resetting filters or changing the active team</p>
        </div>
      ) : (
        filteredItems.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          const isAssignedToMe = item.assignee?.id === currentUser.id;

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                setActivePage('DETAIL');
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition shadow-xs ${
                isSelected
                  ? 'bg-indigo-50/60 border-indigo-400 ring-1 ring-indigo-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                
                {/* Left: ID + Category + Title */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-indigo-700">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-medium text-slate-600 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {item.team}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      v{item.version}
                    </span>
                    {item.activeCollaborators.length > 1 && (
                      <span className="flex items-center gap-1 text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                        <Eye className="w-3 h-3" />
                        {item.activeCollaborators.length} viewing
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {item.title}
                  </h3>

                  {/* Immediate Next Action Banner */}
                  <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-amber-700">Next:</span>
                    <span className="truncate text-[11px] font-medium">{item.nextActionRequired}</span>
                  </div>
                </div>

                {/* Right: Badges */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {getPriorityBadge(item.priority)}
                  {getStatusBadge(item.status)}
                </div>

              </div>

              {/* Bottom Meta Row */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                
                {/* Assignee */}
                <div className="flex items-center gap-1.5">
                  {item.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <img
                        src={item.assignee.avatar}
                        alt={item.assignee.name}
                        className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <span className={isAssignedToMe ? 'text-indigo-700 font-semibold' : 'text-slate-700'}>
                        {item.assignee.name} {isAssignedToMe && '(You)'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        claimWorkItem(item.id);
                      }}
                      className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-semibold border border-indigo-200 transition"
                    >
                      + Take Ownership
                    </button>
                  )}
                </div>

                {/* SLA / Last Modified */}
                <div className="flex items-center gap-2.5">
                  {item.slaExpiresAt && (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <Clock className="w-3 h-3" />
                      SLA: {item.slaExpiresAt}
                    </span>
                  )}
                  <span>
                    Updated {item.lastModifiedAt}
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
