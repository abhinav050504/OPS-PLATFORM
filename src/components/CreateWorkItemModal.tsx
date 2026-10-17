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
      setTagInput('payout, stripe, finance');
    } else if (type === 'SECURITY') {
      setTitle('Compromised API Key Detected in Public GitHub Repository');
      setContext('Security automated scanner detected read/write service account credentials in a contractor repo.');
      setCategory('COMPLIANCE_REQUEST');
      setPriority('P0_CRITICAL');
      setTeam('Trust & Safety');
      setNextActionRequired('Revoke IAM credentials immediately and rotate database secrets');
      setRequiresApproval(false);
      setTagInput('security, credentials, rotation');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Create Operational Work Item</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Capture high-priority operational items with team routing and immediate action directives.
        </p>

        {/* Templates */}
        <div className="mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Incident Preset:</span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => applyTemplate('PAYMENT')}
              className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition shadow-2xs"
            >
              Payment Issue
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('SECURITY')}
              className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition shadow-2xs"
            >
              Security
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('INCIDENT')}
              className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition shadow-2xs"
            >
              Outage
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ingress Controller 502 Bad Gateway Spikes"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Context & Root Cause <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe what triggered this request, the impact on operations..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
              rows={2}
              required
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <label className="block text-amber-900 font-bold uppercase tracking-wider mb-1 text-[11px]">
              What requires attention next? <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nextActionRequired}
              onChange={(e) => setNextActionRequired(e.target.value)}
              placeholder="e.g. Drain node pool ip-10-0-4-122 and scale ingress replicas"
              className="w-full bg-white border border-amber-300 rounded-md px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Category, Priority, Team Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkItemCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800"
              >
                <option value="PRODUCTION_INCIDENT">Production Incident</option>
                <option value="PAYMENT_DISCREPANCY">Payment Discrepancy</option>
                <option value="COMPLIANCE_REQUEST">Compliance Request</option>
                <option value="ENGINEERING_BUG">Engineering Bug</option>
                <option value="CUSTOMER_ISSUE">Customer Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WorkItemPriority)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800"
              >
                <option value="P0_CRITICAL">P0 Critical</option>
                <option value="P1_HIGH">P1 High</option>
                <option value="P2_MEDIUM">P2 Medium</option>
                <option value="P3_LOW">P3 Low</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Responsible Team</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800"
              >
                {TEAMS.filter((t) => t !== 'All Teams').map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags & Approval */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex-1">
              <label className="block text-slate-600 font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="p0, payments"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
              />
            </div>

            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span className="font-medium">Requires Approval Gate</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition"
            >
              Publish Item
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
