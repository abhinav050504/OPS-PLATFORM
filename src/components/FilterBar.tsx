import React from 'react';
import { useOps } from '../context/OpsContext';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { WorkItemPriority, WorkItemStatus } from '../types/ops';

export const FilterBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    setSelectedTeam,
    selectedTeam,
  } = useOps();

  const statuses: { label: string; value: WorkItemStatus | 'ALL' }[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Triage', value: 'TRIAGE' },
    { label: 'Investigating', value: 'INVESTIGATING' },
    { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Blocked', value: 'BLOCKED' },
  ];

  const priorities: { label: string; value: WorkItemPriority | 'ALL' }[] = [
    { label: 'All Priorities', value: 'ALL' },
    { label: 'P0 Critical', value: 'P0_CRITICAL' },
    { label: 'P1 High', value: 'P1_HIGH' },
    { label: 'P2 Medium', value: 'P2_MEDIUM' },
    { label: 'P3 Low', value: 'P3_LOW' },
  ];

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || selectedTeam !== 'All Teams';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSelectedTeam('All Teams');
  };

  return (
    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
      
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ID (OPS-4029), title, tag, context..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        
        {/* Status Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value} className="bg-slate-900 text-slate-200">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value} className="bg-slate-900 text-slate-200">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>
        )}

      </div>
    </div>
  );
};
