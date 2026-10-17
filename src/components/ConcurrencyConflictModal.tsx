import React from 'react';
import { useOps } from '../context/OpsContext';
import { AlertCircle, GitCompare, Check, RotateCcw, X } from 'lucide-react';

export const ConcurrencyConflictModal: React.FC = () => {
  const { conflictState, closeConflictModal, forceResolveConflict } = useOps();

  if (!conflictState || !conflictState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        
        {/* Close icon */}
        <button
          onClick={closeConflictModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Concurrent Modification Conflict</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                HTTP 409
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              <span className="font-mono font-semibold text-indigo-700">{conflictState.item.id}</span> was modified on the server while you were viewing an older version.
            </p>
          </div>
        </div>

        {/* Diff Comparison */}
        <div className="my-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 border-b border-slate-200 pb-2">
            <span className="flex items-center gap-1 text-indigo-700 font-bold">
              <GitCompare className="w-4 h-4" /> Your Local Attempt
            </span>
            <span className="text-emerald-700 font-bold">Server Current (v{conflictState.serverVersion})</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-sans block mb-1 uppercase font-semibold">Your draft:</span>
              <p className="text-indigo-900 font-semibold">
                {JSON.stringify(conflictState.clientIntendedState, null, 2)}
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-sans block mb-1 uppercase font-semibold">Committed by {conflictState.serverState.lastModifiedBy}:</span>
              <p className="text-emerald-900 font-semibold">
                {JSON.stringify(conflictState.serverState, null, 2)}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          To prevent accidental data loss and maintain an accurate audit history, the silent write was stopped. Choose how you want to reconcile:
        </p>

        {/* Resolution Options */}
        <div className="flex items-center justify-end gap-2 text-xs">
          <button
            onClick={() => forceResolveConflict('KEEP_SERVER')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Load Latest (Discard Draft)</span>
          </button>

          <button
            onClick={() => forceResolveConflict('OVERWRITE_WITH_CLIENT')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Force Overwrite with Audit</span>
          </button>
        </div>

      </div>
    </div>
  );
};
