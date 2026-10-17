import React from 'react';
import { useOps } from '../context/OpsContext';
import { Inbox, CheckSquare, Beaker, FileText } from 'lucide-react';

export const NavigationTabs: React.FC = () => {
  const { activePage, setActivePage, workItems } = useOps();

  const pendingApprovalsCount = workItems.filter(
    (w) => w.requiresApproval && w.approvalStatus === 'PENDING'
  ).length;

  const tabs: { id: 'QUEUE' | 'APPROVALS' | 'LAB' | 'AUDIT'; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'QUEUE', label: 'Operations Queue', icon: <Inbox className="w-4 h-4" /> },
    { 
      id: 'APPROVALS', 
      label: 'Approvals & Gates', 
      icon: <CheckSquare className="w-4 h-4" />, 
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined 
    },
    { id: 'LAB', label: 'Concurrency Lab', icon: <Beaker className="w-4 h-4" /> },
    { id: 'AUDIT', label: 'Global Audit Trail', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <nav aria-label="Main Navigation" className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activePage === tab.id || (activePage === 'DETAIL' && tab.id === 'QUEUE');
            return (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
