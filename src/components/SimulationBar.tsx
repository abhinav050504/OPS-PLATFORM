import React from 'react';
import { useOps } from '../context/OpsContext';
import { 
  Zap, 
  RefreshCw, 
  Users, 
  CopyCheck, 
  Cpu, 
  HelpCircle 
} from 'lucide-react';

export const SimulationBar: React.FC = () => {
  const { 
    selectedItem, 
    simulateExternalConflict, 
    simulateRaceConditionClaim, 
    claimWorkItem 
  } = useOps();

  if (!selectedItem) return null;

  const handleTestIdempotency = () => {
    // Generate a fixed key and trigger two rapid executions to demonstrate idempotency
    const idempotencyKey = `REQ-IDEM-${selectedItem.id}-TEST`;
    claimWorkItem(selectedItem.id, idempotencyKey);
    setTimeout(() => {
      claimWorkItem(selectedItem.id, idempotencyKey);
    }, 200);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-y border-indigo-500/30 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/40">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>CRITICAL BEHAVIOUR LAB</span>
          </div>
          <span className="text-slate-400 hidden md:inline">
            Test distributed edge cases on <span className="font-semibold text-white">{selectedItem.id}</span>:
          </span>
        </div>

        {/* Right: Simulation Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* 1. Simulate Remote Conflict */}
          <button
            onClick={() => simulateExternalConflict(selectedItem.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition"
            title="Simulates another colleague modifying the item in another location to test optimistic locking"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Trigger Remote Conflict (v{selectedItem.version} → v{selectedItem.version + 1})</span>
          </button>

          {/* 2. Simulate Race Condition */}
          <button
            onClick={() => simulateRaceConditionClaim(selectedItem.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium transition"
            title="Simulates two users attempting to claim responsibility at the same time"
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>2. Simulate Ownership Race War</span>
          </button>

          {/* 3. Simulate Idempotency */}
          <button
            onClick={handleTestIdempotency}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium transition"
            title="Sends identical rapid requests with same idempotency key to test deduplication"
          >
            <CopyCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>3. Test Rapid Double-Click (Idempotency)</span>
          </button>

        </div>

      </div>
    </div>
  );
};
