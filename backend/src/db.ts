import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import { config } from './config';

// Define DB query interface
export type Db = {
  query: (sql: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number | null }>;
};

// In-Memory Fallback State (used when Postgres is not running)
interface MemoryDb {
  users: Array<{ id: string; email: string; name: string; password_hash: string; is_active: boolean; created_at: string }>;
  teams: Array<{ id: string; name: string; created_at: string }>;
  memberships: Array<{ user_id: string; team_id: string; role: string; created_at: string }>;
  work_items: Array<{
    id: string;
    team_id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee_id: string | null;
    version: number;
    created_by: string;
    created_at: string;
    updated_at: string;
    next_action_required?: string;
    requires_approval?: boolean;
    approval_status?: string;
    tags?: string[];
  }>;
  comments: Array<{ id: string; work_item_id: string; author_id: string; body: string; is_decision?: boolean; created_at: string }>;
  activity_log: Array<{ id: number; work_item_id: string; actor_id: string; type: string; before: any; after: any; summary?: string; created_at: string }>;
  idempotency_keys: Array<{ user_id: string; key: string; request_hash: string; status_code: number; response_body: any; created_at: string }>;
}

let isUsingMemoryDb = false;
let memoryDb: MemoryDb;

async function seedMemoryDb() {
  const hash = await bcrypt.hash('password123', 10);
  
  const team1 = 't-payments';
  const team2 = 't-platform';
  const team3 = 't-compliance';

  const user1 = 'u-sarah';
  const user2 = 'u-marcus';
  const user3 = 'u-elena';
  const user4 = 'u-david';

  memoryDb = {
    users: [
      { id: user1, email: 'alice@example.com', name: 'Sarah Chen', password_hash: hash, is_active: true, created_at: new Date().toISOString() },
      { id: user2, email: 'bob@example.com', name: 'Marcus Vance', password_hash: hash, is_active: true, created_at: new Date().toISOString() },
      { id: user3, email: 'carol@example.com', name: 'Elena Rostova', password_hash: hash, is_active: true, created_at: new Date().toISOString() },
      { id: user4, email: 'dave@example.com', name: 'David Kim', password_hash: hash, is_active: true, created_at: new Date().toISOString() },
    ],
    teams: [
      { id: team1, name: 'Payments', created_at: new Date().toISOString() },
      { id: team2, name: 'Platform', created_at: new Date().toISOString() },
      { id: team3, name: 'Compliance', created_at: new Date().toISOString() },
    ],
    memberships: [
      { user_id: user1, team_id: team1, role: 'lead', created_at: new Date().toISOString() },
      { user_id: user1, team_id: team2, role: 'member', created_at: new Date().toISOString() },
      { user_id: user2, team_id: team1, role: 'member', created_at: new Date().toISOString() },
      { user_id: user3, team_id: team3, role: 'lead', created_at: new Date().toISOString() },
      { user_id: user4, team_id: team2, role: 'lead', created_at: new Date().toISOString() },
    ],
    work_items: [
      {
        id: 'w-4029',
        team_id: team1,
        title: 'Duplicate webhook executions causing double charge on Stripe checkout',
        description: 'Customer support escalated 14 enterprise accounts reporting repeated invoice debit events. Immediate audit found Stripe webhook listener replaying idempotency keys.',
        status: 'in_progress',
        priority: 'urgent',
        assignee_id: user1,
        version: 4,
        created_by: user2,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString(),
        next_action_required: 'Apply database patch to idempotency lock table & prepare bulk ledger reconciliation',
        requires_approval: true,
        approval_status: 'pending',
        tags: ['stripe', 'payments', 'p0'],
      },
      {
        id: 'w-4028',
        team_id: team3,
        title: 'Urgent GDPR Article 17 Data Erasure Request (Client #EU-8841)',
        description: 'EU Legal counsel submitted strict 48-hour compliance mandate to redact PII across analytics warehouse, Kafka cold storage, and backup snapshots.',
        status: 'open',
        priority: 'high',
        assignee_id: user3,
        version: 2,
        created_by: user3,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date().toISOString(),
        next_action_required: 'Compliance Officer sign-off required before BigQuery retention purge script execution',
        requires_approval: true,
        approval_status: 'pending',
        tags: ['gdpr', 'pii', 'legal'],
      },
      {
        id: 'w-4027',
        team_id: team2,
        title: 'Kubernetes Ingress Controller 502 Bad Gateway Spikes in eu-central-1',
        description: 'Grafana alert fired: NGINX ingress error rate spiked to 8.4% across European traffic. Multiple microservices failing health checks intermittently.',
        status: 'in_progress',
        priority: 'urgent',
        assignee_id: user4,
        version: 6,
        created_by: user4,
        created_at: new Date(Date.now() - 10800000).toISOString(),
        updated_at: new Date().toISOString(),
        next_action_required: 'Drain unhealthy node pool ip-10-0-4-122 and scale ingress replicas from 8 to 16',
        requires_approval: false,
        approval_status: 'none',
        tags: ['k8s', 'ingress', 'outage'],
      },
      {
        id: 'w-4024',
        team_id: team1,
        title: 'Tier-1 Enterprise Customer API Rate Limit Elevation ($2M ARR contract)',
        description: 'Acme Corp is running their annual Cyber Sale and requests temporary API rate elevation from 5,000 req/min to 25,000 req/min.',
        status: 'open',
        priority: 'medium',
        assignee_id: null,
        version: 1,
        created_by: user2,
        created_at: new Date(Date.now() - 14400000).toISOString(),
        updated_at: new Date().toISOString(),
        next_action_required: 'Assignee needed to evaluate database read replica capacity before approving elevation',
        requires_approval: true,
        approval_status: 'none',
        tags: ['enterprise', 'rate-limit'],
      },
    ],
    comments: [
      {
        id: 'c-1',
        work_item_id: 'w-4029',
        author_id: user2,
        body: 'Identified root cause: Redis cluster failover triggered a split-brain where lock keys expired prematurely at 19:42 UTC.',
        is_decision: true,
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    activity_log: [
      {
        id: 1,
        work_item_id: 'w-4029',
        actor_id: user2,
        type: 'created',
        before: null,
        after: { status: 'open' },
        summary: 'Work item created from Customer Support escalation.',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 2,
        work_item_id: 'w-4029',
        actor_id: user1,
        type: 'claimed',
        before: { assignee_id: null },
        after: { assignee_id: user1 },
        summary: 'Sarah Chen took responsibility for investigation.',
        created_at: new Date(Date.now() - 2700000).toISOString(),
      },
    ],
    idempotency_keys: [],
  };
}

// Real PostgreSQL Pool
const pgPool = new Pool({
  connectionString: config.databaseUrl,
  connectionTimeoutMillis: 1500, // Quick timeout to fallback if not running
});

pgPool.on('error', () => {
  // Suppress uncaught idle client errors
});

// Resilient query dispatcher
export const pool: Db & { end: () => Promise<void> } = {
  async query(sql: string, params: any[] = []) {
    if (isUsingMemoryDb) {
      return executeMemoryQuery(sql, params);
    }
    try {
      return await pgPool.query(sql, params);
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('connect ECONNREFUSED')) {
        if (!isUsingMemoryDb) {
          console.warn('[db] PostgreSQL not accessible at localhost:5432. Enabling Zero-Setup In-Memory Engine...');
          isUsingMemoryDb = true;
          await seedMemoryDb();
        }
        return executeMemoryQuery(sql, params);
      }
      throw err;
    }
  },
  async end() {
    if (!isUsingMemoryDb) {
      await pgPool.end().catch(() => undefined);
    }
  },
};

// Memory DB query emulator for SQL statements in the codebase
async function executeMemoryQuery(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  if (!memoryDb) {
    await seedMemoryDb();
  }

  const normalized = sql.replace(/\s+/g, ' ').trim();

  // 1. SELECT 1
  if (normalized === 'SELECT 1') {
    return { rows: [{ '?column?': 1 }], rowCount: 1 };
  }

  // 2. Auth: SELECT id, password_hash, is_active FROM users WHERE email = $1
  if (normalized.includes('FROM users WHERE email = $1')) {
    const email = params[0];
    const user = memoryDb.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 3. Auth: SELECT id, email, name FROM users WHERE id = $1
  if (normalized.includes('FROM users WHERE id = $1')) {
    const id = params[0];
    const user = memoryDb.users.find((u) => u.id === id && u.is_active);
    return { rows: user ? [{ id: user.id, email: user.email, name: user.name }] : [], rowCount: user ? 1 : 0 };
  }

  // 4. Auth: SELECT m.team_id, t.name AS team_name, m.role FROM memberships m ...
  if (normalized.includes('FROM memberships m') && normalized.includes('WHERE m.user_id = $1')) {
    const userId = params[0];
    const rows = memoryDb.memberships
      .filter((m) => m.user_id === userId)
      .map((m) => {
        const t = memoryDb.teams.find((x) => x.id === m.team_id);
        return { team_id: m.team_id, team_name: t?.name ?? '', role: m.role };
      });
    return { rows, rowCount: rows.length };
  }

  // 5. Authz: SELECT role FROM memberships WHERE user_id = $1 AND team_id = $2
  if (normalized.includes('FROM memberships WHERE user_id = $1 AND team_id = $2')) {
    const [userId, teamId] = params;
    const m = memoryDb.memberships.find((x) => x.user_id === userId && x.team_id === teamId);
    return { rows: m ? [{ role: m.role }] : [], rowCount: m ? 1 : 0 };
  }

  // Fallback generic rows
  return { rows: [], rowCount: 0 };
}

export async function withTransaction<T>(fn: (client: any) => Promise<T>): Promise<T> {
  if (isUsingMemoryDb) {
    return await fn(pool);
  }
  try {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED' || err.message?.includes('connect ECONNREFUSED')) {
      isUsingMemoryDb = true;
      await seedMemoryDb();
      return await fn(pool);
    }
    throw err;
  }
}

// Export memory store getter/helpers for direct work-items operations
export function getMemoryStore() {
  if (!memoryDb) {
    seedMemoryDb();
  }
  return memoryDb;
}

export function isInMemoryMode() {
  return isUsingMemoryDb;
}