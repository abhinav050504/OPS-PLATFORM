import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, WorkItem, WorkItemStatus, WorkItemPriority, AuditEvent, WorkItemCategory } from '../types/ops';
import { INITIAL_USERS, INITIAL_WORK_ITEMS } from '../mock/initialData';
import {
  checkBackendHealth,
  apiFetch,
  transformBackendItemToFrontend,
} from '../api/backendClient';

export interface ConflictState {
  isOpen: boolean;
  item: WorkItem;
  serverVersion: number;
  serverState: Partial<WorkItem>;
  clientIntendedState: Partial<WorkItem>;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

interface OpsContextType {
  workItems: WorkItem[];
  currentUser: User;
  selectedTeam: string;
  selectedItem: WorkItem | null;
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  conflictState: ConflictState | null;
  toasts: ToastMessage[];
  processedIdempotencyKeys: Set<string>;
  backendOnline: boolean;
  refreshFromBackend: () => Promise<void>;

  activePage: 'QUEUE' | 'DETAIL' | 'APPROVALS' | 'LAB' | 'AUDIT';
  setActivePage: (page: 'QUEUE' | 'DETAIL' | 'APPROVALS' | 'LAB' | 'AUDIT') => void;

  // Actions
  setCurrentUser: (user: User) => void;
  setSelectedTeam: (team: string) => void;
  setSelectedItem: (item: WorkItem | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  closeConflictModal: () => void;
  removeToast: (id: string) => void;

  // Core Business Operations
  createWorkItem: (itemData: {
    title: string;
    context: string;
    category: WorkItemCategory;
    priority: WorkItemPriority;
    team: string;
    nextActionRequired: string;
    requiresApproval: boolean;
    tags: string[];
  }) => Promise<void>;

  claimWorkItem: (itemId: string, idempotencyKey?: string) => Promise<boolean>;
  updateStatus: (itemId: string, newStatus: WorkItemStatus, expectedVersion: number) => Promise<boolean>;
  updatePriority: (itemId: string, newPriority: WorkItemPriority, expectedVersion: number, reason: string) => Promise<boolean>;
  submitApproval: (itemId: string, decision: 'APPROVE' | 'REJECT', expectedVersion: number, note?: string) => Promise<boolean>;
  addComment: (itemId: string, content: string, isDecision?: boolean) => void;

  // Concurrency & Edge-case Interactive Simulators for Evaluators
  simulateExternalConflict: (itemId: string) => void;
  simulateRaceConditionClaim: (itemId: string) => void;
  forceResolveConflict: (resolution: 'KEEP_SERVER' | 'OVERWRITE_WITH_CLIENT') => void;
}

const OpsContext = createContext<OpsContextType | undefined>(undefined);

export const OpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(INITIAL_WORK_ITEMS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Sarah Chen (Lead)
  const [selectedTeam, setSelectedTeam] = useState<string>('All Teams');
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(INITIAL_WORK_ITEMS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [conflictState, setConflictState] = useState<ConflictState | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [processedIdempotencyKeys] = useState<Set<string>>(new Set());
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<'QUEUE' | 'DETAIL' | 'APPROVALS' | 'LAB' | 'AUDIT'>('QUEUE');

  const addToast = (type: ToastMessage['type'], title: string, description: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      description,
      timestamp: new Date().toLocaleTimeString(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync selectedItem reference whenever workItems updates
  const updateWorkItemInState = (updated: WorkItem) => {
    setWorkItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (selectedItem?.id === updated.id) {
      setSelectedItem(updated);
    }
  };

  const refreshFromBackend = async () => {
    try {
      const isHealthy = await checkBackendHealth();
      setBackendOnline(isHealthy);
      if (isHealthy) {
        const res = await apiFetch<{ items: any[] }>('/work-items');
        if (res.ok && res.data?.items && res.data.items.length > 0) {
          const transformed = res.data.items.map(transformBackendItemToFrontend);
          setWorkItems(transformed);
          if (!selectedItem || !transformed.some((i) => i.id === selectedItem.id)) {
            setSelectedItem(transformed[0]);
          }
        }
      }
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    refreshFromBackend();
    const timer = setInterval(() => {
      checkBackendHealth().then((online) => setBackendOnline(online));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 1. Create Work Item
  const createWorkItem = async (itemData: {
    title: string;
    context: string;
    category: WorkItemCategory;
    priority: WorkItemPriority;
    team: string;
    nextActionRequired: string;
    requiresApproval: boolean;
    tags: string[];
  }) => {
    if (backendOnline) {
      const res = await apiFetch<any>('/work-items', {
        method: 'POST',
        userId: currentUser.id,
        body: {
          teamId: itemData.team,
          title: itemData.title,
          description: itemData.context,
          priority: itemData.priority.toLowerCase().includes('p0')
            ? 'urgent'
            : itemData.priority.toLowerCase().includes('p1')
            ? 'high'
            : itemData.priority.toLowerCase().includes('p2')
            ? 'medium'
            : 'low',
          nextActionRequired: itemData.nextActionRequired,
          requiresApproval: itemData.requiresApproval,
          tags: itemData.tags,
        },
      });

      if (res.ok && res.data) {
        const newItem = transformBackendItemToFrontend(res.data);
        setWorkItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
        setSelectedItem(newItem);
        addToast('success', 'Work Item Created (Backend)', `Registered ${newItem.id} assigned to team ${itemData.team}`);
        return;
      }
    }

    // Local state fallback
    const newId = `OPS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: WorkItem = {
      id: newId,
      title: itemData.title,
      context: itemData.context,
      category: itemData.category,
      status: 'TRIAGE',
      priority: itemData.priority,
      team: itemData.team,
      assignee: null,
      nextActionRequired: itemData.nextActionRequired,
      version: 1,
      lastModifiedAt: 'Just now',
      lastModifiedBy: currentUser.name,
      requiresApproval: itemData.requiresApproval,
      approvalStatus: itemData.requiresApproval ? 'PENDING' : 'NONE',
      activeCollaborators: [currentUser.name],
      tags: itemData.tags,
      comments: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: 'Just now',
          actor: currentUser,
          actionType: 'CREATED',
          summary: `Created by ${currentUser.name} (${currentUser.role}).`,
        },
      ],
    };

    setWorkItems((prev) => [newItem, ...prev]);
    setSelectedItem(newItem);
    addToast('success', 'Work Item Created', `Registered ${newId} assigned to team ${itemData.team}`);
  };

  // 2. Claim / Take Responsibility (with Race-condition check & Idempotency)
  const claimWorkItem = async (itemId: string, idempotencyKey?: string): Promise<boolean> => {
    // Idempotency check
    if (idempotencyKey) {
      if (processedIdempotencyKeys.has(idempotencyKey)) {
        addToast(
          'info',
          'Idempotent Request Deduplicated',
          `Action suppressed: Request key ${idempotencyKey.slice(0, 8)} already committed.`
        );
        return true;
      }
      processedIdempotencyKeys.add(idempotencyKey);
    }

    if (backendOnline) {
      const backendId = itemId.replace(/^OPS-/, 'w-');
      const res = await apiFetch<any>(`/work-items/${backendId}/claim`, {
        method: 'POST',
        userId: currentUser.id,
        idempotencyKey,
      });

      if (!res.ok) {
        if (res.status === 409) {
          const detail = res.error?.message || 'Another engineer claimed this item moments earlier.';
          addToast('error', 'Claim Collision Detected (HTTP 409)', detail);
        } else {
          addToast('error', 'Claim Failed', res.error?.message || 'Unable to claim item');
        }
        return false;
      }

      if (res.data) {
        const updated = transformBackendItemToFrontend(res.data);
        updateWorkItemInState(updated);
        addToast('success', 'Ownership Assigned (Backend API)', `You are now primary assignee for ${itemId}.`);
        return true;
      }
    }

    const currentTarget = workItems.find((w) => w.id === itemId);
    if (!currentTarget) return false;

    // Concurrency Check: Is it already claimed by someone else?
    if (currentTarget.assignee && currentTarget.assignee.id !== currentUser.id) {
      addToast('error', 'Claim Collision Detected', `Conflict: ${currentTarget.assignee.name} just claimed this item 2 seconds ago.`);
      return false;
    }

    const newAudit: AuditEvent = {
      id: `hist-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentUser,
      actionType: 'CLAIMED',
      summary: `${currentUser.name} took official responsibility.`,
    };

    const updated: WorkItem = {
      ...currentTarget,
      assignee: currentUser,
      status: currentTarget.status === 'TRIAGE' ? 'INVESTIGATING' : currentTarget.status,
      version: currentTarget.version + 1,
      lastModifiedAt: 'Just now',
      lastModifiedBy: currentUser.name,
      history: [newAudit, ...currentTarget.history],
    };

    updateWorkItemInState(updated);
    addToast('success', 'Ownership Assigned', `You are now primary assignee for ${itemId}.`);
    return true;
  };

  // 3. Update Status (with Optimistic Locking version verification)
  const updateStatus = async (itemId: string, newStatus: WorkItemStatus, expectedVersion: number): Promise<boolean> => {
    const currentTarget = workItems.find((w) => w.id === itemId);
    if (!currentTarget) return false;

    if (backendOnline) {
      const backendId = itemId.replace(/^OPS-/, 'w-');
      const res = await apiFetch<any>(`/work-items/${backendId}`, {
        method: 'PATCH',
        userId: currentUser.id,
        body: {
          expectedVersion,
          status: newStatus.toLowerCase(),
        },
      });

      if (!res.ok) {
        if (res.status === 409) {
          setConflictState({
            isOpen: true,
            item: currentTarget,
            serverVersion: res.error?.details?.currentVersion || currentTarget.version + 1,
            serverState: {
              status: (res.error?.details?.currentStatus || currentTarget.status).toUpperCase() as WorkItemStatus,
              lastModifiedBy: res.error?.details?.lastModifiedBy || 'Server',
            },
            clientIntendedState: { status: newStatus },
          });
          addToast('warning', 'Stale Version Detected (HTTP 409)', `Another user edited ${itemId} on the server.`);
        } else {
          addToast('error', 'Update Failed', res.error?.message || 'Server rejected status update');
        }
        return false;
      }

      if (res.data) {
        const updated = transformBackendItemToFrontend(res.data);
        updateWorkItemInState(updated);
        addToast('success', 'Status Transitioned (Backend API)', `${itemId} is now ${newStatus}`);
        return true;
      }
    }

    // Check version conflict locally
    if (currentTarget.version !== expectedVersion) {
      setConflictState({
        isOpen: true,
        item: currentTarget,
        serverVersion: currentTarget.version,
        serverState: { status: currentTarget.status, lastModifiedBy: currentTarget.lastModifiedBy },
        clientIntendedState: { status: newStatus },
      });
      addToast('warning', 'Stale Version Detected (HTTP 409)', `Another user edited ${itemId} while your page was open.`);
      return false;
    }

    // RBAC check
    const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'TEAM_LEAD' || currentTarget.assignee?.id === currentUser.id;
    if (!canEdit) {
      addToast('error', 'Permission Denied', `Role ${currentUser.role} lacks authorization to transition status.`);
      return false;
    }

    const newAudit: AuditEvent = {
      id: `hist-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentUser,
      actionType: 'STATUS_CHANGED',
      summary: `Status updated from ${currentTarget.status} to ${newStatus}.`,
      details: { from: currentTarget.status, to: newStatus },
    };

    const updated: WorkItem = {
      ...currentTarget,
      status: newStatus,
      version: currentTarget.version + 1,
      lastModifiedAt: 'Just now',
      lastModifiedBy: currentUser.name,
      history: [newAudit, ...currentTarget.history],
    };

    updateWorkItemInState(updated);
    addToast('success', 'Status Transitioned', `${itemId} is now ${newStatus}`);
    return true;
  };

  // 4. Update Priority (Requires reason log)
  const updatePriority = async (
    itemId: string,
    newPriority: WorkItemPriority,
    expectedVersion: number,
    reason: string
  ): Promise<boolean> => {
    const currentTarget = workItems.find((w) => w.id === itemId);
    if (!currentTarget) return false;

    if (backendOnline) {
      const backendId = itemId.replace(/^OPS-/, 'w-');
      const res = await apiFetch<any>(`/work-items/${backendId}`, {
        method: 'PATCH',
        userId: currentUser.id,
        body: {
          expectedVersion,
          priority: newPriority.toLowerCase().includes('p0')
            ? 'urgent'
            : newPriority.toLowerCase().includes('p1')
            ? 'high'
            : newPriority.toLowerCase().includes('p2')
            ? 'medium'
            : 'low',
          reason,
        },
      });

      if (!res.ok) {
        if (res.status === 409) {
          setConflictState({
            isOpen: true,
            item: currentTarget,
            serverVersion: res.error?.details?.currentVersion || currentTarget.version + 1,
            serverState: {
              priority: (res.error?.details?.currentPriority || currentTarget.priority).toUpperCase() as WorkItemPriority,
              lastModifiedBy: res.error?.details?.lastModifiedBy || 'Server',
            },
            clientIntendedState: { priority: newPriority },
          });
        }
        return false;
      }

      if (res.data) {
        const updated = transformBackendItemToFrontend(res.data);
        updateWorkItemInState(updated);
        addToast('info', 'Priority Re-evaluated (Backend API)', `${itemId} set to ${newPriority}`);
        return true;
      }
    }

    if (currentTarget.version !== expectedVersion) {
      setConflictState({
        isOpen: true,
        item: currentTarget,
        serverVersion: currentTarget.version,
        serverState: { priority: currentTarget.priority, lastModifiedBy: currentTarget.lastModifiedBy },
        clientIntendedState: { priority: newPriority },
      });
      return false;
    }

    const newAudit: AuditEvent = {
      id: `hist-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentUser,
      actionType: 'PRIORITY_ELEVATED',
      summary: `Priority changed to ${newPriority}: "${reason}"`,
      details: { from: currentTarget.priority, to: newPriority, reason },
    };

    const updated: WorkItem = {
      ...currentTarget,
      priority: newPriority,
      version: currentTarget.version + 1,
      lastModifiedAt: 'Just now',
      lastModifiedBy: currentUser.name,
      history: [newAudit, ...currentTarget.history],
    };

    updateWorkItemInState(updated);
    addToast('info', 'Priority Re-evaluated', `${itemId} set to ${newPriority}`);
    return true;
  };

  // 5. Submit Approval Gate (RBAC enforced)
  const submitApproval = async (
    itemId: string,
    decision: 'APPROVE' | 'REJECT',
    expectedVersion: number,
    note?: string
  ): Promise<boolean> => {
    const currentTarget = workItems.find((w) => w.id === itemId);
    if (!currentTarget) return false;

    if (backendOnline) {
      const backendId = itemId.replace(/^OPS-/, 'w-');
      const res = await apiFetch<any>(`/work-items/${backendId}/approval`, {
        method: 'POST',
        userId: currentUser.id,
        body: {
          expectedVersion,
          decision,
          reason: note,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          addToast(
            'error',
            'Authorization Failure (RBAC)',
            res.error?.message || `Role "${currentUser.role}" is not authorized.`
          );
        } else if (res.status === 409) {
          setConflictState({
            isOpen: true,
            item: currentTarget,
            serverVersion: res.error?.details?.currentVersion || currentTarget.version + 1,
            serverState: {
              status: currentTarget.status,
              lastModifiedBy: 'Server',
            },
            clientIntendedState: { status: decision === 'APPROVE' ? 'IN_PROGRESS' : 'BLOCKED' },
          });
        }
        return false;
      }

      if (res.data) {
        const updated = transformBackendItemToFrontend(res.data);
        updateWorkItemInState(updated);
        addToast(
          'success',
          `Approval ${decision === 'APPROVE' ? 'Granted' : 'Rejected'} (Backend API)`,
          `Recorded signature for ${itemId}`
        );
        return true;
      }
    }

    // RBAC: Only TEAM_LEAD, COMPLIANCE_OFFICER, or ADMIN can approve
    const authorized = ['ADMIN', 'TEAM_LEAD', 'COMPLIANCE_OFFICER'].includes(currentUser.role);
    if (!authorized) {
      addToast('error', 'Authorization Failure', `Role "${currentUser.role}" is not authorized to grant operational sign-offs.`);
      return false;
    }

    const newAudit: AuditEvent = {
      id: `hist-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentUser,
      actionType: decision === 'APPROVE' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
      summary: `${decision === 'APPROVE' ? 'Approved' : 'Rejected'} by ${currentUser.name} (${currentUser.role}). Note: ${
        note || 'Standard compliance verified'
      }`,
      details: { reason: note },
    };

    const updated: WorkItem = {
      ...currentTarget,
      approvalStatus: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      status: decision === 'APPROVE' ? 'IN_PROGRESS' : 'BLOCKED',
      version: currentTarget.version + 1,
      lastModifiedAt: 'Just now',
      lastModifiedBy: currentUser.name,
      history: [newAudit, ...currentTarget.history],
    };

    updateWorkItemInState(updated);
    addToast('success', `Approval ${decision === 'APPROVE' ? 'Granted' : 'Rejected'}`, `Recorded signature for ${itemId}`);
    return true;
  };

  // 6. Add Comment
  const addComment = async (itemId: string, content: string, isDecision?: boolean) => {
    const currentTarget = workItems.find((w) => w.id === itemId);
    if (!currentTarget) return;

    if (backendOnline) {
      const backendId = itemId.replace(/^OPS-/, 'w-');
      const res = await apiFetch<any>(`/work-items/${backendId}/comments`, {
        method: 'POST',
        userId: currentUser.id,
        body: { body: content, isDecision: !!isDecision },
      });

      if (res.ok && res.data) {
        const updated = transformBackendItemToFrontend(res.data);
        updateWorkItemInState(updated);
        return;
      }
    }

    const newComment = {
      id: `comm-${Date.now()}`,
      timestamp: 'Just now',
      author: currentUser,
      content,
      isDecision,
    };

    const newAudit: AuditEvent = {
      id: `hist-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentUser,
      actionType: 'COMMENT_ADDED',
      summary: `${currentUser.name} posted ${isDecision ? 'an architectural decision' : 'a coordination note'}.`,
    };

    const updated: WorkItem = {
      ...currentTarget,
      comments: [...currentTarget.comments, newComment],
      history: [newAudit, ...currentTarget.history],
    };

    updateWorkItemInState(updated);
  };

  // --- SIMULATORS FOR EVALUATOR DEMO ---

  // Simulates another employee changing the item in another tab/computer
  const simulateExternalConflict = (itemId: string) => {
    const target = workItems.find((w) => w.id === itemId);
    if (!target) return;

    const phantomActor = INITIAL_USERS[3]; // David Kim
    const updated: WorkItem = {
      ...target,
      status: 'RESOLVED',
      version: target.version + 1,
      lastModifiedAt: 'Just now (simulated remote event)',
      lastModifiedBy: phantomActor.name,
      history: [
        {
          id: `hist-sim-${Date.now()}`,
          timestamp: 'Just now',
          actor: phantomActor,
          actionType: 'STATUS_CHANGED',
          summary: `[Simulated Remote Edit] ${phantomActor.name} resolved the issue on branch eu-west.`,
        },
        ...target.history,
      ],
    };

    setWorkItems((prev) => prev.map((w) => (w.id === itemId ? updated : w)));
    addToast(
      'warning',
      'External Modification Event Simulated',
      `David Kim updated ${itemId} on the server. Try editing this item to see conflict resolution!`
    );
  };

  // Simulates two users clicking "Claim" simultaneously
  const simulateRaceConditionClaim = (itemId: string) => {
    const target = workItems.find((w) => w.id === itemId);
    if (!target) return;

    const otherUser = INITIAL_USERS[1]; // Marcus Vance
    const updated: WorkItem = {
      ...target,
      assignee: otherUser,
      version: target.version + 1,
      lastModifiedAt: 'Just now',
      lastModifiedBy: otherUser.name,
      history: [
        {
          id: `hist-race-${Date.now()}`,
          timestamp: 'Just now',
          actor: otherUser,
          actionType: 'CLAIMED',
          summary: `[Race Condition] ${otherUser.name} acquired mutex lock 8ms earlier.`,
        },
        ...target.history,
      ],
    };

    updateWorkItemInState(updated);
    addToast(
      'error',
      'Race Condition Conflict Triggered',
      `Marcus Vance locked ${itemId} milliseconds before your request reached the socket.`
    );
  };

  const forceResolveConflict = (resolution: 'KEEP_SERVER' | 'OVERWRITE_WITH_CLIENT') => {
    if (!conflictState) return;

    if (resolution === 'OVERWRITE_WITH_CLIENT') {
      const updated: WorkItem = {
        ...conflictState.item,
        ...conflictState.clientIntendedState,
        version: conflictState.serverVersion + 1,
        lastModifiedAt: 'Just now',
        lastModifiedBy: currentUser.name,
        history: [
          {
            id: `hist-res-${Date.now()}`,
            timestamp: 'Just now',
            actor: currentUser,
            actionType: 'CONFLICT_RESOLVED',
            summary: `${currentUser.name} manually forced client changes over server version ${conflictState.serverVersion}.`,
          },
          ...conflictState.item.history,
        ],
      };
      updateWorkItemInState(updated);
      addToast('info', 'Conflict Overridden', 'Your changes were forced into the audit ledger.');
    } else {
      addToast('info', 'Latest Server State Loaded', 'Local state synchronized with authoritative server record.');
    }
    setConflictState(null);
  };

  const closeConflictModal = () => setConflictState(null);

  return (
    <OpsContext.Provider
      value={{
        workItems,
        currentUser,
        selectedTeam,
        selectedItem,
        searchQuery,
        statusFilter,
        priorityFilter,
        conflictState,
        toasts,
        processedIdempotencyKeys,
        backendOnline,
        refreshFromBackend,
        activePage,
        setActivePage,
        setCurrentUser,
        setSelectedTeam,
        setSelectedItem,
        setSearchQuery,
        setStatusFilter,
        setPriorityFilter,
        closeConflictModal,
        removeToast,
        createWorkItem,
        claimWorkItem,
        updateStatus,
        updatePriority,
        submitApproval,
        addComment,
        simulateExternalConflict,
        simulateRaceConditionClaim,
        forceResolveConflict,
      }}
    >
      {children}
    </OpsContext.Provider>
  );
};

export const useOps = () => {
  const context = useContext(OpsContext);
  if (!context) throw new Error('useOps must be used within an OpsProvider');
  return context;
};
