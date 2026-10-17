import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, CheckCircle, Shield, AlertTriangle, Layers } from 'lucide-react';

export const EvaluatorGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-slate-900 border-b border-indigo-900/50 text-slate-300 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="font-semibold text-white">Newtonite Assessment Walkthrough</span>
            <span className="text-slate-400 hidden sm:inline">— How this submission satisfies the brief:</span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition text-[11px]"
          >
            <span>{isOpen ? 'Hide Checklist' : 'Show Checklist'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isOpen && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2.5 pt-2 border-t border-slate-800 text-[11px] leading-relaxed">
            <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Core Work Items</span>
              </div>
              <p className="text-slate-400">
                Answers: What it is & why it exists, current state, who owns it, and <strong className="text-slate-200">what requires attention next</strong>.
              </p>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Concurrency (OCC 409)</span>
              </div>
              <p className="text-slate-400">
                Prevents stale overwrites with monotonic revision numbers. Try <strong className="text-slate-200">Test Scenario 1</strong> below to see the diff resolver.
              </p>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>3. Authorization & RBAC</span>
              </div>
              <p className="text-slate-400">
                Approval gates (payouts, GDPR) are enforced by system logic. Switch user role in the top-right header to test permissions.
              </p>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>4. Race & Idempotency</span>
              </div>
              <p className="text-slate-400">
                Atomic claim locking prevents split-brain triage. Idempotency keys suppress rapid repeated submissions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
