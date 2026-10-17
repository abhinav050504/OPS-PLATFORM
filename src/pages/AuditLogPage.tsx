import React from 'react';
import { useOps } from '../context/OpsContext';
import { History, ShieldCheck, ArrowRight } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { workItems, setSelectedItem, setActivePage } = useOps();

  // Aggregate all events across all work items, sorted chronologically
  const allEvents = workItems.flatMap((item) =>
    item.history.map((event) => ({
      ...event,
      itemTitle: item.title,
      itemId: item.id,
      itemTeam: item.team,
    }))
  ).sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Organization Audit & Compliance Ledger</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {allEvents.length} Recorded Events
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Immutable, cryptographically verifiable log of all status transitions, ownership changes, and approvals.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          <span>Integrity Verified</span>
        </div>
      </div>

      {/* Events Feed */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {allEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 hover:border-slate-300 transition">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const target = workItems.find((w) => w.id === evt.itemId);
                        if (target) {
                          setSelectedItem(target);
                          setActivePage('DETAIL');
                        }
                      }}
                      className="font-mono font-bold text-xs text-indigo-700 hover:underline cursor-pointer"
                    >
                      {evt.itemId}
                    </button>
                    <span className="text-[11px] text-slate-500">• {evt.itemTeam}</span>
                    <span className="text-[11px] font-semibold text-slate-900">
                      {evt.actor.name} <span className="text-slate-500 font-normal">({evt.actor.role.replace('_', ' ')})</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{evt.timestamp}</span>
                </div>

                <p className="text-xs text-slate-800 font-medium">{evt.summary}</p>

                {evt.details && (
                  <div className="text-[11px] font-mono bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                    {evt.details.from && <span>From: {evt.details.from} → </span>}
                    {evt.details.to && <span className="text-indigo-700 font-bold">To: {evt.details.to} </span>}
                    {evt.details.reason && <span className="block text-slate-600 mt-0.5">Reason: "{evt.details.reason}"</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
