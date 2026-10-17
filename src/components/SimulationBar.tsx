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
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Label */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 font-semibold border border-indigo-800/60 text-[11px]">
            <Beaker className="w-3.5 h-3.5 text-indigo-400" />
            <span>CRITICAL BEHAVIOUR LAB</span>
          </div>
          <span className="text-slate-400 hidden lg:inline">
            Test distributed systems correctness on <span className="font-mono text-white font-semibold">{selectedItem.id}</span>:
          </span>
        </div>

        {/* Right: The 3 Tests */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Test 1: OCC Conflict */}
          <button
            onClick={() => simulateExternalConflict(selectedItem.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
            title="Simulates another colleague modifying this item on the server behind your back"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Trigger Version Conflict (v{selectedItem.version} → v{selectedItem.version + 1})</span>
          </button>

          {/* Test 2: Race Condition */}
          <button
            onClick={() => simulateRaceConditionClaim(selectedItem.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
            title="Simulates two users trying to claim ownership at the exact same millisecond"
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>2. Simulate Claim Race War</span>
          </button>

          {/* Test 3: Idempotency */}
          <button
            onClick={handleTestIdempotency}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
            title="Simulates accidental rapid double-clicking"
          >
            <CopyCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>3. Test Rapid Double-Click (Idempotency)</span>
          </button>

        </div>

      </div>
    </div>
  );
};
