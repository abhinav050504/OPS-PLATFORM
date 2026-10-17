export type WorkItemCategory = 
  | 'CUSTOMER_ISSUE' 
  | 'ENGINEERING_BUG' 
  | 'PAYMENT_DISCREPANCY' 
  | 'PRODUCTION_INCIDENT' 
  | 'COMPLIANCE_REQUEST' 
  | 'OPERATIONAL_APPROVAL';

export type WorkItemStatus = 
  | 'TRIAGE' 
  | 'INVESTIGATING' 
  | 'PENDING_APPROVAL' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'BLOCKED';

export type WorkItemPriority = 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM' | 'P3_LOW';

export type UserRole = 'ADMIN' | 'TEAM_LEAD' | 'OPERATIONS_ENGINEER' | 'COMPLIANCE_OFFICER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teams: string[];
  avatar: string;
}

export type AuditActionType = 
  | 'CREATED'
  | 'CLAIMED'
  | 'REASSIGNED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_ELEVATED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REJECTED'
  | 'BLOCKED'
  | 'COMMENT_ADDED'
  | 'CONFLICT_RESOLVED';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: User;
  actionType: AuditActionType;
  summary: string;
  details?: {
    from?: string;
    to?: string;
    reason?: string;
  };
}

export interface WorkItemComment {
  id: string;
  timestamp: string;
  author: User;
  content: string;
  isDecision?: boolean;
}

export interface WorkItem {
  id: string;
  title: string;
  context: string;
  category: WorkItemCategory;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  team: string;
  assignee: User | null;
  nextActionRequired: string;
  version: number;
  lastModifiedAt: string;
  lastModifiedBy: string;
  requiresApproval: boolean;
  approvalStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: User;
  activeCollaborators: string[];
  history: AuditEvent[];
  comments: WorkItemComment[];
  slaExpiresAt?: string;
  tags: string[];
}
