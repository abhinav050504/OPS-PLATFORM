import { WorkItem, WorkItemStatus, WorkItemPriority, User, AuditEvent } from '../types/ops';

export const API_BASE = 'http://localhost:3000';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1200) });
    return res.ok;
  } catch {
    return false;
  }
}

export const mapFrontendUserToBackend = (userId: string): string => {
  const map: Record<string, string> = {
    user_1: 'u-sarah',
    user_2: 'u-marcus',
    user_3: 'u-elena',
    user_4: 'u-david',
    user_5: 'u-sarah',
  };
  return map[userId] || 'u-sarah';
};

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    userId?: string;
    idempotencyKey?: string;
  } = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: any }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (options.userId) {
      headers['x-user-id'] = mapFrontendUserToBackend(options.userId);
    }
    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, status: res.status, error: json?.error || json };
    }

    return { ok: true, status: res.status, data: json };
  } catch (err: any) {
    return { ok: false, status: 503, error: { message: err.message || 'Backend unreachable' } };
  }
}

export function transformBackendItemToFrontend(b: any): WorkItem {
  // Map status
  let status: WorkItemStatus = 'IN_PROGRESS';
  const rawStatus = (b.status || '').toLowerCase();
  if (rawStatus === 'open' || rawStatus === 'triage') status = 'TRIAGE';
  else if (rawStatus === 'investigating' || rawStatus === 'in_review') status = 'INVESTIGATING';
  else if (rawStatus === 'in_progress') status = 'IN_PROGRESS';
  else if (rawStatus === 'blocked') status = 'BLOCKED';
  else if (rawStatus === 'resolved' || rawStatus === 'closed') status = 'RESOLVED';
  else if (rawStatus === 'pending_approval') status = 'PENDING_APPROVAL';
  else status = (b.status?.toUpperCase() as WorkItemStatus) || 'IN_PROGRESS';

  // Map priority
  let priority: WorkItemPriority = 'P2_MEDIUM';
  const rawPriority = (b.priority || '').toLowerCase();
  if (rawPriority === 'urgent' || rawPriority.includes('p0')) priority = 'P0_CRITICAL';
  else if (rawPriority === 'high' || rawPriority.includes('p1')) priority = 'P1_HIGH';
  else if (rawPriority === 'medium' || rawPriority.includes('p2')) priority = 'P2_MEDIUM';
  else if (rawPriority === 'low' || rawPriority.includes('p3')) priority = 'P3_LOW';

  // Map approvalStatus
  let approvalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'NONE';
  const rawApp = (b.approval_status || '').toLowerCase();
  if (rawApp === 'pending') approvalStatus = 'PENDING';
  else if (rawApp === 'approved') approvalStatus = 'APPROVED';
  else if (rawApp === 'rejected') approvalStatus = 'REJECTED';

  // Map assignee
  let assignee: User | null = null;
  if (b.assignee) {
    assignee = {
      id: b.assignee.id,
      name: b.assignee.name,
      email: b.assignee.email,
      role: 'OPERATIONS_ENGINEER',
      teams: [b.teamName || 'Payments Engineering'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    };
  }

  // Map comments
  const comments = (b.comments || []).map((c: any) => ({
    id: String(c.id),
    timestamp: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    author: {
      id: c.author?.id || 'u-sarah',
      name: c.author?.name || 'Sarah Chen',
      email: c.author?.email || 'sarah.chen@newtonite.internal',
      role: 'TEAM_LEAD' as const,
      teams: ['Payments Engineering'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    content: c.body || c.content,
    isDecision: c.is_decision ?? c.isDecision ?? false,
  }));

  // Map history / activity log
  const history: AuditEvent[] = (b.activity || []).map((a: any) => ({
    id: String(a.id),
    timestamp: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    actor: {
      id: a.actor?.id || 'u-sarah',
      name: a.actor?.name || 'System Operator',
      email: a.actor?.email || 'system@newtonite.internal',
      role: 'ADMIN' as const,
      teams: ['Core Infrastructure'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    actionType:
      a.type?.toUpperCase() === 'CLAIMED' ? 'CLAIMED' :
      a.type?.toUpperCase() === 'STATUS_CHANGED' ? 'STATUS_CHANGED' :
      a.type?.toUpperCase().includes('APPROVAL') ? (a.type.includes('grant') ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED') :
      'CREATED',
    summary: a.summary || 'Item modified',
  }));

  const cleanId = b.id.startsWith('OPS-') ? b.id : `OPS-${b.id.replace(/^w-/, '')}`;

  return {
    id: cleanId,
    title: b.title,
    context: b.description || b.context || '',
    category: 'PAYMENT_DISCREPANCY',
    status,
    priority,
    team: b.teamName || 'Payments Engineering',
    assignee,
    nextActionRequired: b.next_action_required || 'Investigate root cause and apply remediation',
    version: b.version || 1,
    lastModifiedAt: b.updated_at ? new Date(b.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    lastModifiedBy: b.createdByName || 'Sarah Chen',
    requiresApproval: !!b.requires_approval,
    approvalStatus,
    activeCollaborators: ['Sarah Chen', 'Marcus Vance'],
    comments,
    history,
    tags: b.tags || ['ops'],
  };
}
