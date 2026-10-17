import React from 'react';
import { StatsOverview } from '../components/StatsOverview';
import { FilterBar } from '../components/FilterBar';
import { WorkItemList } from '../components/WorkItemList';

export const QueuePage: React.FC = () => {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Metric Overview Cards */}
      <StatsOverview />

      {/* 2. Filter & Search Controls */}
      <FilterBar />

      {/* 3. Spacious Full-Width Work Items Queue */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <WorkItemList />
      </div>
    </div>
  );
};
