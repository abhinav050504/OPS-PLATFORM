import React, { useState } from 'react';
import { useOps } from '../context/OpsContext';
import { WorkItemPriority, WorkItemStatus } from '../types/ops';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  History, 
  MessageSquare, 
  FileText, 
  Lock, 
  Flame, 
  Send, 
  Layers, 
  AlertCircle,
  Tag,
  Eye,
  Check
} from 'lucide-react';

export const WorkItemDetail: React.FC = () => {
  const {
    selectedItem,
    currentUser,
    claimWorkItem,
    updateStatus,
    updatePriority,
    submitApproval,
    addComment,
  } = useOps();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AUDIT_TRAIL' | 'COMMENTS'>('OVERVIEW');
  const [commentText, setCommentText] = useState('');
  const [isDecisionComment, setIsDecisionComment] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [newPriorityCandidate, setNewPriorityCandidate] = useState<WorkItemPriority>('P1_HIGH');
  const [priorityReason, setPriorityReason] = useState('');

  if (!selectedItem) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
        Select a work item from the queue to inspect details and history.
      </div>
    );
  }

  const isAssignedToMe = selectedItem.assignee?.id === currentUser.id;
  const canApprove = ['ADMIN', 'TEAM_LEAD', 'COMPLIANCE_OFFICER'].includes(currentUser.role);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(selectedItem.id, commentText, isDecisionComment);
    setCommentText('');
    setIsDecisionComment(false);
  };

  const handlePrioritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priorityReason.trim()) return;
    updatePriority(selectedItem.id, newPriorityCandidate, selectedItem.version, priorityReason);
    setShowPriorityModal(false);
    setPriorityReason('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      
      {/* Top Banner: ID, Status, Actions */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/70">
        
        {/* Presence / Collaborators */}
        {selectedItem.activeCollaborators.length > 0 && (
          <div className="flex items-center gap-2 mb-3 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active viewers on this record:</span>
            <span className="text-slate-200 font-medium">{selectedItem.activeCollaborators.join(', ')}</span>
            <span className="ml-auto font-mono text-[10px] text-slate-500">Version v{selectedItem.version}</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-400">
                {selectedItem.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {selectedItem.team}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                {selectedItem.category.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {selectedItem.title}
            </h2>
          </div>

          {/* Quick Action: Ownership Claim */}
          <div className="shrink-0 flex items-center gap-2">
            {!isAssignedToMe && (
              <button
                onClick={() => claimWorkItem(selectedItem.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Take Ownership</span>
              </button>
            )}
            
            {/* Priority Trigger */}
            <button
              onClick={() => {
                setNewPriorityCandidate(selectedItem.priority);
                setShowPriorityModal(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 font-medium transition"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Priority</span>
            </button>
          </div>
        </div>

        {/* Priority Change Modal / Popover */}
        {showPriorityModal && (
          <form onSubmit={handlePrioritySubmit} className="mt-3 p-3 bg-slate-900 rounded-lg border border-indigo-500/40 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Re-evaluate Item Priority</span>
              <button type="button" onClick={() => setShowPriorityModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="flex gap-2">
              {(['P0_CRITICAL', 'P1_HIGH', 'P2_MEDIUM', 'P3_LOW'] as WorkItemPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriorityCandidate(p)}
                  className={`px-2 py-1 rounded text-[11px] font-bold ${
                    newPriorityCandidate === p ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Mandatory rationale for audit ledger (e.g. financial risk, SLA breach)..."
              value={priorityReason}
              onChange={(e) => setPriorityReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              required
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowPriorityModal(false)} className="px-2.5 py-1 text-slate-400">Cancel</button>
              <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded font-medium">Confirm Change</button>
            </div>
          </form>
        )}

        {/* Operational Attention Callout (What Requires Attention Next) */}
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Immediate Attention Required Next:</span>
          </div>
          <p className="text-sm font-medium text-slate-200">
            {selectedItem.nextActionRequired}
          </p>
        </div>

        {/* Operational Sign-Off / Approval Gate */}
        {selectedItem.requiresApproval && selectedItem.approvalStatus === 'PENDING' && (
          <div className="mt-3 p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>Operational Approval Gate Enforced</span>
              </div>
              <p className="text-xs text-slate-400">
                Action requires explicit verification from <span className="text-slate-300 font-medium">Team Lead, Compliance, or Admin</span>.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => submitApproval(selectedItem.id, 'APPROVE', selectedItem.version, approvalNote)}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Grant Approval</span>
              </button>
              <button
                onClick={() => submitApproval(selectedItem.id, 'REJECT', selectedItem.version, approvalNote || 'Rejected due to risk')}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold transition"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 flex items-center gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`py-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'OVERVIEW'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Investigation & Context</span>
        </button>
        <button
          onClick={() => setActiveTab('AUDIT_TRAIL')}
          className={`py-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'AUDIT_TRAIL'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail ({selectedItem.history.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('COMMENTS')}
          className={`py-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'COMMENTS'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Decisions & Notes ({selectedItem.comments.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-5">
            {/* What it is and why it exists */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Operational Context & Root Cause Summary
              </h4>
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedItem.context}
              </div>
            </div>

            {/* Quick Status Transition Dropdown */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Change Lifecycle Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {(['TRIAGE', 'INVESTIGATING', 'IN_PROGRESS', 'RESOLVED', 'BLOCKED'] as WorkItemStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedItem.id, status, selectedItem.version)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      selectedItem.status === status
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Assignee</span>
                <p className="text-xs font-medium text-slate-200 mt-1">
                  {selectedItem.assignee ? selectedItem.assignee.name : 'Unassigned (Triage)'}
                </p>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Responsible Team</span>
                <p className="text-xs font-medium text-slate-200 mt-1">{selectedItem.team}</p>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Concurrency Version</span>
                <p className="text-xs font-medium text-emerald-400 font-mono mt-1">
                  Revision #{selectedItem.version}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                Classification Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT TRAIL */}
        {activeTab === 'AUDIT_TRAIL' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Immutable Ledger of Operations</span>
              <span className="font-mono text-[11px] text-indigo-400">Hash verified</span>
            </div>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {selectedItem.history.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        {event.actor.name}
                        <span className="text-slate-500 font-normal ml-1">({event.actor.role})</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{event.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-300">{event.summary}</p>

                    {event.details && (
                      <div className="mt-1 text-[11px] font-mono bg-slate-900 px-2 py-1 rounded text-slate-400">
                        {event.details.from && <span>From: {event.details.from} → </span>}
                        {event.details.to && <span className="text-indigo-300">To: {event.details.to} </span>}
                        {event.details.reason && <span className="block text-slate-400 mt-0.5">Reason: "{event.details.reason}"</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMMENTS & DECISIONS */}
        {activeTab === 'COMMENTS' && (
          <div className="space-y-4">
            
            {/* List of comments */}
            <div className="space-y-3">
              {selectedItem.comments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No notes or decisions posted yet.</p>
              ) : (
                selectedItem.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-3.5 rounded-xl border ${
                      comm.isDecision
                        ? 'bg-indigo-950/30 border-indigo-500/40'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={comm.author.avatar}
                          alt={comm.author.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-white">{comm.author.name}</span>
                        {comm.isDecision && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                            DECISION RECORD
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{comm.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{comm.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Post Form */}
            <form onSubmit={handlePostComment} className="pt-3 border-t border-slate-800 space-y-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Log a technical observation or architectural decision..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDecisionComment}
                    onChange={(e) => setIsDecisionComment(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Mark as Official Decision (Pinned to Audit Log)</span>
                </label>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Note</span>
                </button>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
