import React from 'react';
import { useOps } from '../context/OpsContext';
import { Beaker, RefreshCw, Users, CopyCheck, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ConcurrencyLabPage: React.FC = () => {
  const { 
    workItems, 
    selectedItem, 
    setSelectedItem, 
    simulateExternalConflict, 
    simulateRaceConditionClaim, 
    claimWorkItem,
    setActivePage 
  } = useOps();

  const currentItem = selectedItem || workItems[0];

  const handleTestIdempotency = () => {
    if (!currentItem) return;
    const idempotencyKey = `REQ-IDEM-${currentItem.id}-TEST`;
    claimWorkItem(currentItem.id, idempotencyKey);
    setTimeout(() => {
      claimWorkItem(currentItem.id, idempotencyKey);
    }, 200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <Beaker className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Distributed Concurrency & Reliability Laboratory</h2>
            <p className="text-xs text-slate-500">
              Interactive test harness designed for Newtonite evaluators to test distributed edge cases.
            </p>
          </div>
        </div>

        {/* Work item selector */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Target Work Item:</span>
            <select
              value={currentItem.id}
              onChange={(e) => {
                const found = workItems.find((w) => w.id === e.target.value);
                if (found) setSelectedItem(found);
              }}
              className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 font-mono font-bold text-indigo-700 cursor-pointer"
            >
              {workItems.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} — {w.title.slice(0, 45)}... (v{w.version})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSelectedItem(currentItem);
              setActivePage('DETAIL');
            }}
            className="flex items-center gap-1.5 text-indigo-700 font-semibold hover:text-indigo-900 transition"
          >
            <span>View Full Record</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Scenario 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>1. Stale Data Conflict (409)</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Optimistic Concurrency (OCC)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulates a remote user modifying <span className="font-mono font-semibold text-slate-900">{currentItem.id}</span> in the database. If you attempt an edit on an outdated revision, the server rejects the silent overwrite and triggers the <strong>Side-by-Side Diff Reconciliation Modal</strong>.
            </p>
          </div>

          <button
            onClick={() => simulateExternalConflict(currentItem.id)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Trigger Remote Edit (v{currentItem.version} → v{currentItem.version + 1})</span>
          </button>
        </div>

        {/* Scenario 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
              <Users className="w-4 h-4 text-rose-600" />
              <span>2. Claim Collision</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Race Condition Mutex</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulates two engineers clicking "Take Ownership" at the exact same millisecond. The atomic compare-and-swap lease awards ownership to the first requester and alerts the second with a graceful conflict message.
            </p>
          </div>

          <button
            onClick={() => simulateRaceConditionClaim(currentItem.id)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Simulate Race Condition</span>
          </button>
        </div>

        {/* Scenario 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider">
              <CopyCheck className="w-4 h-4 text-sky-600" />
              <span>3. Double-Click Suppression</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Idempotency Protection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fires two duplicate requests within 200ms with identical client-generated idempotency keys. The backend identifies the duplicate and suppresses redundant audit events or secondary tasks.
            </p>
          </div>

          <button
            onClick={handleTestIdempotency}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <CopyCheck className="w-3.5 h-3.5" />
            <span>Test Idempotency Burst</span>
          </button>
        </div>

      </div>

      {/* Target Status Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs flex items-center justify-between text-slate-600">
        <div>
          <span className="font-semibold text-slate-900">{currentItem.id}: </span>
          <span>Status is currently <strong className="text-indigo-700">{currentItem.status}</strong>, Revision <strong className="text-slate-900">v{currentItem.version}</strong>, Assignee: <strong className="text-slate-900">{currentItem.assignee ? currentItem.assignee.name : 'Unassigned'}</strong></span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">Lock: Healthy</span>
      </div>
    </div>
  );
};
