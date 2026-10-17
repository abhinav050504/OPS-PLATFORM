import React from 'react';
import { useOps } from '../context/OpsContext';
import { Lock, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const { workItems, setSelectedItem, setActivePage, submitApproval, currentUser } = useOps();

  const approvalItems = workItems.filter(
    (w) => w.requiresApproval && w.approvalStatus === 'PENDING'
  );

  const canApprove = ['ADMIN', 'TEAM_LEAD', 'COMPLIANCE_OFFICER'].includes(currentUser.role);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">Operational Approval Gates</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
              {approvalItems.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Sensitive actions requiring verified legal, management, or compliance authorization before progression.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Your Active Authority</span>
          <span className={`text-xs font-bold ${canApprove ? 'text-emerald-700' : 'text-slate-500'}`}>
            {currentUser.role.replace('_', ' ')} {canApprove ? '(Authorized)' : '(Read Only)'}
          </span>
        </div>
      </div>

      {/* List of Pending Items */}
      {approvalItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">All Approval Queues Clear</h3>
          <p className="text-xs text-slate-500 mt-1">There are currently no items blocked on sign-off.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvalItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-700">{item.id}</span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.team}
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      Approval Gate
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 mt-2">
                    <span className="font-bold text-slate-900">Justification: </span>
                    {item.context}
                  </div>

                  <div className="text-xs text-amber-900 font-medium pt-1">
                    <strong>Pending Action:</strong> {item.nextActionRequired}
                  </div>
                </div>

                {/* Approval Action Buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => submitApproval(item.id, 'APPROVE', item.version)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize</span>
                  </button>

                  <button
                    onClick={() => submitApproval(item.id, 'REJECT', item.version, 'Rejected from approvals center')}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setActivePage('DETAIL');
                    }}
                    className="flex items-center justify-center gap-1 text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold pt-1 transition"
                  >
                    <span>Full Inspection</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
