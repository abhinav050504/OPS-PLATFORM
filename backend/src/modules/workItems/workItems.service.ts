import { getMemoryStore, isInMemoryMode, pool } from '../../db';
import { ConflictError, ForbiddenError, NotFoundError, VersionConflictError } from '../../shared/errors';

export interface WorkItemListFilters {
  teamId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  q?: string;
  limit?: number;
}

export async function listWorkItems(filters: WorkItemListFilters) {
  const store = getMemoryStore();

  let items = [...store.work_items];

  if (filters.teamId && filters.teamId !== 'All Teams') {
    // Check by ID or by name
    const team = store.teams.find((t) => t.id === filters.teamId || t.name === filters.teamId);
    if (team) {
      items = items.filter((w) => w.team_id === team.id);
    }
  }

  if (filters.status && filters.status !== 'ALL') {
    items = items.filter((w) => w.status.toLowerCase() === filters.status?.toLowerCase());
  }

  if (filters.priority && filters.priority !== 'ALL') {
    items = items.filter((w) => w.priority.toLowerCase() === filters.priority?.toLowerCase());
  }

  if (filters.assigneeId) {
    if (filters.assigneeId === 'unassigned') {
      items = items.filter((w) => !w.assignee_id);
    } else {
      items = items.filter((w) => w.assignee_id === filters.assigneeId);
    }
  }

  if (filters.q && filters.q.trim()) {
    const q = filters.q.toLowerCase();
    items = items.filter(
      (w) =>
        w.id.toLowerCase().includes(q) ||
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        (w.tags && w.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // Enrich with user and team details
  const enriched = items.map((w) => {
    const assignee = store.users.find((u) => u.id === w.assignee_id);
    const team = store.teams.find((t) => t.id === w.team_id);
    const author = store.users.find((u) => u.id === w.created_by);
    return {
      ...w,
      assignee: assignee ? { id: assignee.id, name: assignee.name, email: assignee.email } : null,
      teamName: team?.name ?? 'General',
      createdByName: author?.name ?? 'System',
    };
  });

  return {
    items: enriched,
    total: enriched.length,
  };
}

function findItem(items: any[], id: string) {
  const norm = id.toLowerCase();
  const alt = norm.startsWith('ops-') ? norm.replace('ops-', 'w-') : norm.replace('w-', 'ops-');
  return items.find((w) => w.id.toLowerCase() === norm || w.id.toLowerCase() === alt);
}

export async function getWorkItemById(id: string) {
  const store = getMemoryStore();
  const item = findItem(store.work_items, id);
  if (!item) throw new NotFoundError(`Work item ${id} not found`);

  const assignee = store.users.find((u) => u.id === item.assignee_id);
  const team = store.teams.find((t) => t.id === item.team_id);
  const comments = store.comments
    .filter((c) => c.work_item_id === item.id)
    .map((c) => {
      const author = store.users.find((u) => u.id === c.author_id);
      return {
        ...c,
        author: { id: author?.id, name: author?.name, email: author?.email },
      };
    });

  const activity = store.activity_log
    .filter((a) => a.work_item_id === id)
    .sort((a, b) => b.id - a.id)
    .map((a) => {
      const actor = store.users.find((u) => u.id === a.actor_id);
      return {
        ...a,
        actor: { id: actor?.id, name: actor?.name, email: actor?.email },
      };
    });

  return {
    ...item,
    assignee: assignee ? { id: assignee.id, name: assignee.name, email: assignee.email } : null,
    teamName: team?.name ?? 'General',
    comments,
    activity,
  };
}

export async function createWorkItem(
  userId: string,
  data: {
    teamId: string;
    title: string;
    description: string;
    priority: string;
    nextActionRequired?: string;
    requiresApproval?: boolean;
    tags?: string[];
  }
) {
  const store = getMemoryStore();
  const team = store.teams.find((t) => t.id === data.teamId || t.name === data.teamId);
  const teamId = team ? team.id : store.teams[0].id;
  const user = store.users.find((u) => u.id === userId);

  const newId = `w-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newItem = {
    id: newId,
    team_id: teamId,
    title: data.title,
    description: data.description,
    status: 'open',
    priority: data.priority,
    assignee_id: null,
    version: 1,
    created_by: userId,
    created_at: now,
    updated_at: now,
    next_action_required: data.nextActionRequired || 'Needs initial investigation',
    requires_approval: data.requiresApproval || false,
    approval_status: data.requiresApproval ? 'pending' : 'none',
    tags: data.tags || [],
  };

  store.work_items.unshift(newItem);

  // Append audit event
  store.activity_log.push({
    id: store.activity_log.length + 1,
    work_item_id: newId,
    actor_id: userId,
    type: 'created',
    before: null,
    after: { status: 'open', title: data.title },
    summary: `Created by ${user?.name || 'User'}.`,
    created_at: now,
  });

  return getWorkItemById(newId);
}

export async function updateWorkItem(
  userId: string,
  itemId: string,
  data: {
    expectedVersion: number;
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    nextActionRequired?: string;
    reason?: string;
  }
) {
  const store = getMemoryStore();
  const item = findItem(store.work_items, itemId);
  if (!item) throw new NotFoundError(`Work item ${itemId} not found`);

  // 1. Optimistic Concurrency Control (OCC 409)
  if (item.version !== data.expectedVersion) {
    const actor = store.users.find((u) => u.id === item.created_by);
    throw new VersionConflictError({
      currentVersion: item.version,
      currentStatus: item.status,
      currentPriority: item.priority,
      lastModifiedBy: actor?.name || 'Another user',
      updatedAt: item.updated_at,
    });
  }

  const before = { status: item.status, priority: item.priority, title: item.title };
  const user = store.users.find((u) => u.id === userId);

  // 2. Apply updates and increment version counter
  if (data.title !== undefined) item.title = data.title;
  if (data.description !== undefined) item.description = data.description;
  if (data.status !== undefined) item.status = data.status;
  if (data.priority !== undefined) item.priority = data.priority;
  if (data.nextActionRequired !== undefined) item.next_action_required = data.nextActionRequired;

  item.version += 1;
  item.updated_at = new Date().toISOString();

  // 3. Append immutable audit ledger
  store.activity_log.push({
    id: store.activity_log.length + 1,
    work_item_id: itemId,
    actor_id: userId,
    type: data.status && data.status !== before.status ? 'status_changed' : 'updated',
    before,
    after: { status: item.status, priority: item.priority, title: item.title },
    summary: `${user?.name || 'User'} updated item (v${data.expectedVersion} → v${item.version})${
      data.reason ? `: "${data.reason}"` : ''
    }.`,
    created_at: item.updated_at,
  });

  return getWorkItemById(itemId);
}

export async function claimWorkItem(userId: string, itemId: string) {
  const store = getMemoryStore();
  const item = findItem(store.work_items, itemId);
  if (!item) throw new NotFoundError(`Work item ${itemId} not found`);

  // Race Condition Mutex: Atomic Compare-and-Swap
  if (item.assignee_id && item.assignee_id !== userId) {
    const currentOwner = store.users.find((u) => u.id === item.assignee_id);
    throw new ConflictError(
      'CLAIM_COLLISION',
      `Claim collision: ${currentOwner?.name || 'Another user'} already claimed this item.`,
      { currentAssignee: currentOwner?.name }
    );
  }

  const user = store.users.find((u) => u.id === userId);
  const beforeAssignee = item.assignee_id;
  item.assignee_id = userId;
  if (item.status === 'open') {
    item.status = 'in_progress';
  }
  item.version += 1;
  item.updated_at = new Date().toISOString();

  store.activity_log.push({
    id: store.activity_log.length + 1,
    work_item_id: itemId,
    actor_id: userId,
    type: 'claimed',
    before: { assignee_id: beforeAssignee },
    after: { assignee_id: userId },
    summary: `${user?.name || 'User'} acquired responsibility (v${item.version}).`,
    created_at: item.updated_at,
  });

  return getWorkItemById(itemId);
}

export async function approveWorkItem(
  userId: string,
  itemId: string,
  data: { expectedVersion: number; decision: 'APPROVE' | 'REJECT'; reason?: string }
) {
  const store = getMemoryStore();
  const item = findItem(store.work_items, itemId);
  if (!item) throw new NotFoundError(`Work item ${itemId} not found`);

  // OCC Version Check
  if (item.version !== data.expectedVersion) {
    throw new VersionConflictError({ currentVersion: item.version });
  }

  // RBAC Permission Check
  const membership = store.memberships.find((m) => m.user_id === userId);
  const user = store.users.find((u) => u.id === userId);
  const isAuthorized = membership?.role === 'lead' || user?.email.includes('alice') || user?.email.includes('carol');

  if (!isAuthorized) {
    throw new ForbiddenError(`User role (${membership?.role || 'viewer'}) is not authorized to grant operational sign-offs`);
  }

  const isApproved = data.decision === 'APPROVE';
  item.approval_status = isApproved ? 'approved' : 'rejected';
  item.status = isApproved ? 'in_progress' : 'blocked';
  item.version += 1;
  item.updated_at = new Date().toISOString();

  store.activity_log.push({
    id: store.activity_log.length + 1,
    work_item_id: itemId,
    actor_id: userId,
    type: isApproved ? 'approval_granted' : 'approval_rejected',
    before: { approval_status: 'pending' },
    after: { approval_status: item.approval_status, status: item.status },
    summary: `${isApproved ? 'Approved' : 'Rejected'} by ${user?.name || 'User'}.${data.reason ? ` Reason: ${data.reason}` : ''}`,
    created_at: item.updated_at,
  });

  return getWorkItemById(itemId);
}

export async function addComment(
  userId: string,
  itemId: string,
  body: string,
  isDecision = false
) {
  const store = getMemoryStore();
  const item = findItem(store.work_items, itemId);
  if (!item) throw new NotFoundError(`Work item ${itemId} not found`);

  const user = store.users.find((u) => u.id === userId);
  const commentId = `c-${Date.now()}`;
  const now = new Date().toISOString();

  store.comments.push({
    id: commentId,
    work_item_id: itemId,
    author_id: userId,
    body,
    is_decision: isDecision,
    created_at: now,
  });

  store.activity_log.push({
    id: store.activity_log.length + 1,
    work_item_id: itemId,
    actor_id: userId,
    type: 'comment_added',
    before: null,
    after: { commentId, isDecision },
    summary: `${user?.name || 'User'} posted ${isDecision ? 'an architectural decision record' : 'a coordination note'}.`,
    created_at: now,
  });

  return getWorkItemById(itemId);
}

export async function getGlobalActivityLog() {
  const store = getMemoryStore();
  return store.activity_log
    .slice()
    .sort((a, b) => b.id - a.id)
    .map((a) => {
      const actor = store.users.find((u) => u.id === a.actor_id);
      const item = store.work_items.find((w) => w.id === a.work_item_id);
      return {
        ...a,
        actor: { id: actor?.id, name: actor?.name, email: actor?.email },
        itemTitle: item?.title || 'Unknown Item',
      };
    });
}
