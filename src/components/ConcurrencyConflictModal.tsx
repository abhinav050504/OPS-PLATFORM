import React from 'react';
import { useOps } from '../context/OpsContext';
import { AlertTriangle, GitCompare, Check, RotateCcw, X, ShieldAlert } from 'lucide-react';

export const ConcurrencyConflictModal: React.FC = () => {
  const { conflictState, closeConflictModal, forceResolveConflict } = useOps();

  if (!conflictState || !conflictState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl shadow-amber-950/40 relative">
        
        {/* Close icon */}
        <button
          onClick={closeConflictModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Concurrent Modification Conflict</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                HTTP 409 CONFLICT
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Work item <span className="font-mono text-indigo-400">{conflictState.item.id}</span> was modified on the server while you were viewing an older version.
            </p>
          </div>
        </div>

        {/* Side-by-Side Diff Comparison */}
        <div className="my-4 bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-indigo-400">
              <GitCompare className="w-4 h-4" />
              <span>Your Intended Change (Stale client)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>Latest Server State (v{conflictState.serverVersion})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            {/* Client attempt */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-indigo-500/30 space-y-1">
              <span className="text-[10px] uppercase font-sans text-slate-500">Your Action:</span>
              <p className="text-indigo-300 font-bold">
                {JSON.stringify(conflictState.clientIntendedState, null, 2)}
              </p>
              <p className="text-[10px] text-slate-400 font-sans mt-2">
                Based on cached version #{conflictState.item.version}
              </p>
            </div>

            {/* Server current */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase font-sans text-slate-500">Server Committed:</span>
              <p className="text-emerald-300 font-bold">
                {JSON.stringify(conflictState.serverState, null, 2)}
              </p>
              <p className="text-[10px] text-slate-400 font-sans mt-2">
                Committed by {conflictState.serverState.lastModifiedBy || 'another team member'}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          To protect data consistency and prevent accidental overwrites, the system blocked the silent write. Choose how you would like to reconcile this record:
        </p>

        {/* Resolution Options */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => forceResolveConflict('KEEP_SERVER')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>Accept Server State (Discard My Edit)</span>
          </button>

          <button
            onClick={() => forceResolveConflict('OVERWRITE_WITH_CLIENT')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition"
          >
            <Check className="w-4 h-4" />
            <span>Force Overwrite with Audit Note</span>
          </button>
        </div>

      </div>
    </div>
  );
};
