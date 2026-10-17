import React from 'react';
import { useOps } from '../context/OpsContext';
import { RefreshCw, Users, CopyCheck, Beaker } from 'lucide-react';

export const SimulationBar: React.FC = () => {
  const { 
    selectedItem, 
    simulateExternalConflict, 
    simulateRaceConditionClaim, 
    claimWorkItem 
  } = useOps();

  if (!selectedItem) return null;

  const handleTestIdempotency = () => {
    const idempotencyKey = `REQ-IDEM-${selectedItem.id}-TEST`;
    claimWorkItem(selectedItem.id, idempotencyKey);
    setTimeout(() => {
      claimWorkItem(selectedItem.id, idempotencyKey);
    }, 200);
  };

  return (
    <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Label */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 text-[11px]">
            <Beaker className="w-3.5 h-3.5 text-indigo-600" />
            <span>CRITICAL BEHAVIOUR LAB</span>
          </div>
          <span className="text-slate-600 hidden lg:inline">
            Test distributed systems scenarios on <span className="font-mono text-slate-900 font-bold">{selectedItem.id}</span>:
          </span>
        </div>

        {/* Right: The 3 Tests */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Test 1: OCC Conflict */}
          <button
            onClick={() => simulateExternalConflict(selectedItem.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium shadow-xs transition"
            title="Simulates another colleague modifying this item on the server behind your back"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>1. Trigger Version Conflict (v{selectedItem.version} → v{selectedItem.version + 1})</span>
          </button>

          {/* Test 2: Race Condition */}
          <button
            onClick={() => simulateRaceConditionClaim(selectedItem.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium shadow-xs transition"
            title="Simulates two users trying to claim ownership at the exact same millisecond"
          >
            <Users className="w-3.5 h-3.5 text-rose-600" />
            <span>2. Simulate Claim Race</span>
          </button>

          {/* Test 3: Idempotency */}
          <button
            onClick={handleTestIdempotency}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium shadow-xs transition"
            title="Simulates accidental rapid double-clicking"
          >
            <CopyCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>3. Test Rapid Double-Click</span>
          </button>

        </div>

      </div>
    </div>
  );
};
