import React, { useState } from 'react';
import { useOps } from '../context/OpsContext';
import { WorkItemPriority, WorkItemStatus } from '../types/ops';
import { 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  History, 
  MessageSquare, 
  FileText, 
  Lock, 
  Flame, 
  Send, 
  Tag,
  Eye,
  AlertCircle,
  ArrowLeft
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
    setActivePage,
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
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs shadow-xs">
        Select a work item from the queue to inspect details and history.
      </div>
    );
  }

  const isAssignedToMe = selectedItem.assignee?.id === currentUser.id;

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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      
      {/* Top Banner */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70">
        
        {/* Back navigation & presence row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            onClick={() => setActivePage('QUEUE')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Work Queue</span>
          </button>

          {selectedItem.activeCollaborators.length > 0 && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-600 shadow-2xs">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Viewing:</span>
              <span className="text-slate-900 font-semibold">{selectedItem.activeCollaborators.join(', ')}</span>
              <span className="font-mono text-[10px] text-slate-500">v{selectedItem.version}</span>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-indigo-700">
                {selectedItem.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-medium">
                {selectedItem.team}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {selectedItem.category.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {selectedItem.title}
            </h2>
          </div>

          {/* Quick Actions: Claim & Priority */}
          <div className="shrink-0 flex items-center gap-2">
            {!isAssignedToMe && (
              <button
                onClick={() => claimWorkItem(selectedItem.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Take Ownership</span>
              </button>
            )}
            
            <button
              onClick={() => {
                setNewPriorityCandidate(selectedItem.priority);
                setShowPriorityModal(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs border border-slate-300 font-medium shadow-xs transition"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Change Priority</span>
            </button>
          </div>
        </div>

        {/* Priority Change Form */}
        {showPriorityModal && (
          <form onSubmit={handlePrioritySubmit} className="mt-3 p-3 bg-white rounded-lg border border-indigo-200 text-xs space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Re-evaluate Priority</span>
              <button type="button" onClick={() => setShowPriorityModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="flex gap-2">
              {(['P0_CRITICAL', 'P1_HIGH', 'P2_MEDIUM', 'P3_LOW'] as WorkItemPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriorityCandidate(p)}
                  className={`px-2 py-1 rounded text-[11px] font-bold ${
                    newPriorityCandidate === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Mandatory rationale for audit ledger..."
              value={priorityReason}
              onChange={(e) => setPriorityReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
              required
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowPriorityModal(false)} className="px-2.5 py-1 text-slate-500 hover:text-slate-800">Cancel</button>
              <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded font-medium shadow-xs">Save Change</button>
            </div>
          </form>
        )}

        {/* Prominent Next Action Required Callout */}
        <div className="mt-3 p-3 rounded-lg bg-amber-50/80 border-l-4 border-amber-500 shadow-2xs">
          <div className="flex items-center gap-1.5 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>What Requires Attention Next:</span>
          </div>
          <p className="text-xs font-semibold text-slate-900">
            {selectedItem.nextActionRequired}
          </p>
        </div>

        {/* Operational Sign-Off / Approval Gate */}
        {selectedItem.requiresApproval && selectedItem.approvalStatus === 'PENDING' && (
          <div className="mt-3 p-3 rounded-lg bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                <Lock className="w-3.5 h-3.5 text-indigo-700" />
                <span>Operational Approval Gate Enforced</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Action requires sign-off from <strong className="text-slate-900">Team Lead, Compliance, or Admin</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => submitApproval(selectedItem.id, 'APPROVE', selectedItem.version, approvalNote)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Grant Approval</span>
              </button>
              <button
                onClick={() => submitApproval(selectedItem.id, 'REJECT', selectedItem.version, approvalNote || 'Rejected')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 transition"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white px-4 flex items-center gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`py-2.5 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'OVERVIEW'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Investigation Context</span>
        </button>
        <button
          onClick={() => setActiveTab('AUDIT_TRAIL')}
          className={`py-2.5 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'AUDIT_TRAIL'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Ledger ({selectedItem.history.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('COMMENTS')}
          className={`py-2.5 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'COMMENTS'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Decisions & Notes ({selectedItem.comments.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Why This Item Exists & Operational Context
              </h4>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line shadow-2xs">
                {selectedItem.context}
              </div>
            </div>

            {/* Lifecycle Status Buttons */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Lifecycle State Transition (OCC Enforced)
              </h4>
              <div className="flex flex-wrap gap-2">
                {(['TRIAGE', 'INVESTIGATING', 'IN_PROGRESS', 'RESOLVED', 'BLOCKED'] as WorkItemStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedItem.id, status, selectedItem.version)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-2xs ${
                      selectedItem.status === status
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Assignee</span>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">
                  {selectedItem.assignee ? selectedItem.assignee.name : 'Unassigned (Triage)'}
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Team</span>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">{selectedItem.team}</p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Revision</span>
                <p className="text-xs font-mono font-bold text-indigo-700 mt-0.5">
                  Version #{selectedItem.version}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex flex-wrap gap-1.5">
                {selectedItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
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
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Immutable Ledger of Operations</span>
              <span className="font-mono text-[11px] text-indigo-700 font-semibold">Audit verified</span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {selectedItem.history.map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {event.actor.name}
                        <span className="text-slate-500 font-normal ml-1">({event.actor.role})</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{event.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-700">{event.summary}</p>

                    {event.details && (
                      <div className="mt-1 text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-600">
                        {event.details.from && <span>From: {event.details.from} → </span>}
                        {event.details.to && <span className="text-indigo-700 font-semibold">To: {event.details.to} </span>}
                        {event.details.reason && <span className="block text-slate-500 mt-0.5">Reason: "{event.details.reason}"</span>}
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
            <div className="space-y-3">
              {selectedItem.comments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No notes or decisions posted yet.</p>
              ) : (
                selectedItem.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-3 rounded-lg border ${
                      comm.isDecision
                        ? 'bg-indigo-50/70 border-indigo-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={comm.author.avatar}
                          alt={comm.author.name}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="text-xs font-bold text-slate-900">{comm.author.name}</span>
                        {comm.isDecision && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 border border-indigo-300">
                            DECISION RECORD
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{comm.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">{comm.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post comment */}
            <form onSubmit={handlePostComment} className="pt-3 border-t border-slate-200 space-y-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Log a technical observation or architectural decision..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                rows={2}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDecisionComment}
                    onChange={(e) => setIsDecisionComment(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <span>Mark as Official Architectural Decision</span>
                </label>

                <button
                  type="submit"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
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
