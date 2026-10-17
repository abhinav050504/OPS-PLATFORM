import React, { useState } from 'react';
import { useOps } from '../context/OpsContext';
import { TEAMS } from '../mock/initialData';
import { WorkItemCategory, WorkItemPriority } from '../types/ops';
import { X, PlusCircle, Sparkles } from 'lucide-react';

interface CreateWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkItemModal: React.FC<CreateWorkItemModalProps> = ({ isOpen, onClose }) => {
  const { createWorkItem } = useOps();

  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [category, setCategory] = useState<WorkItemCategory>('PRODUCTION_INCIDENT');
  const [priority, setPriority] = useState<WorkItemPriority>('P1_HIGH');
  const [team, setTeam] = useState(TEAMS[1]);
  const [nextActionRequired, setNextActionRequired] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [tagInput, setTagInput] = useState('incident, urgent');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !context.trim() || !nextActionRequired.trim()) return;

    createWorkItem({
      title,
      context,
      category,
      priority,
      team,
      nextActionRequired,
      requiresApproval,
      tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
    });

    onClose();
  };

  const applyTemplate = (type: 'PAYMENT' | 'SECURITY' | 'INCIDENT') => {
    if (type === 'PAYMENT') {
      setTitle('Payment Gateway Reconciliation Discrepancy (Payout Hold)');
      setContext('Finance reported a $22,400 mismatch between checkout ledger and merchant settlement report for batch #ST-991.');
      setCategory('PAYMENT_DISCREPANCY');
      setPriority('P0_CRITICAL');
      setTeam('Payments Engineering');
      setNextActionRequired('Authorize manual ledger reconciliation & re-attempt settlement sync');
      setRequiresApproval(true);
      setTagInput('payout, stripe, finance, reconciliation');
    } else if (type === 'SECURITY') {
      setTitle('Compromised API Key Detected in Public GitHub Repository');
      setContext('Security automated scanner detected read/write service account credentials in a contractor repo.');
      setCategory('COMPLIANCE_REQUEST');
      setPriority('P0_CRITICAL');
      setTeam('Trust & Safety');
      setNextActionRequired('Revoke IAM credentials immediately and rotate database secrets');
      setRequiresApproval(false);
      setTagInput('security, credentials, rotation, p0');
    } else {
      setTitle('High Latency Spike on User Authentication Service');
      setContext('P99 response times exceeded 2500ms on /v1/auth endpoint. Redis cache eviction rate spiked 400%.');
      setCategory('PRODUCTION_INCIDENT');
      setPriority('P1_HIGH');
      setTeam('Core Infrastructure');
      setNextActionRequired('Scale cache cluster and inspect connection pool saturation');
      setRequiresApproval(false);
      setTagInput('auth, redis, latency');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <PlusCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Create Operational Work Item</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Capture high-priority operational items with explicit team routing and immediate action directives.
        </p>

        {/* Quick Template Presets */}
        <div className="mb-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Quick Incident Template:</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => applyTemplate('PAYMENT')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Payment Issue
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('SECURITY')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Security Leak
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('INCIDENT')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Auth Latency
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Title / Summary <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ingress Controller 502 Bad Gateway Spikes in eu-central-1"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Context & Why it exists */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Why it exists & Operational Context <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe what triggered this request, the impact on operations or users, and preliminary findings..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              rows={3}
              required
            />
          </div>

          {/* Next Action Required */}
          <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/40">
            <label className="block text-amber-300 font-bold uppercase tracking-wider mb-1">
              What requires attention next? <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={nextActionRequired}
              onChange={(e) => setNextActionRequired(e.target.value)}
              placeholder="e.g. Drain node pool ip-10-0-4-122 and scale ingress replicas to 16"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Category, Priority, Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkItemCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
              >
                <option value="PRODUCTION_INCIDENT">Production Incident</option>
                <option value="PAYMENT_DISCREPANCY">Payment Discrepancy</option>
                <option value="COMPLIANCE_REQUEST">Compliance Request</option>
                <option value="ENGINEERING_BUG">Engineering Bug</option>
                <option value="CUSTOMER_ISSUE">Customer Issue</option>
                <option value="OPERATIONAL_APPROVAL">Operational Approval</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WorkItemPriority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
              >
                <option value="P0_CRITICAL">P0 Critical</option>
                <option value="P1_HIGH">P1 High</option>
                <option value="P2_MEDIUM">P2 Medium</option>
                <option value="P3_LOW">P3 Low</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Responsible Team</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
              >
                {TEAMS.filter((t) => t !== 'All Teams').map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags & Approval requirement */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-slate-400 font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="payments, outage, p0"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
              />
            </div>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              <span className="font-medium">Requires Operational Approval Gate</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              Publish to Operations Queue
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
