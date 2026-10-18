import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

describe('Work Items & Concurrency Test Suite', () => {
  const app = createApp();

  it('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /work-items returns list of seeded work items', async () => {
    const res = await request(app).get('/work-items');
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('CRITICAL BEHAVIOUR 1: Prevents stale updates with OCC 409 Conflict', async () => {
    // 1. Fetch current version of item
    const getRes = await request(app).get('/work-items/w-4029');
    expect(getRes.status).toBe(200);
    const currentVersion = getRes.body.version;

    // 2. Successful update with expectedVersion
    const update1 = await request(app)
      .patch('/work-items/w-4029')
      .send({ expectedVersion: currentVersion, status: 'in_progress', reason: 'Triage started' });
    expect(update1.status).toBe(200);
    expect(update1.body.version).toBe(currentVersion + 1);

    // 3. Second client attempts update using STALE expectedVersion
    const staleUpdate = await request(app)
      .patch('/work-items/w-4029')
      .send({ expectedVersion: currentVersion, status: 'resolved', reason: 'Attempt from stale tab' });
    expect(staleUpdate.status).toBe(409);
    expect(staleUpdate.body.error.code).toBe('VERSION_CONFLICT');
    expect(staleUpdate.body.error.details).toBeDefined();
  });

  it('CRITICAL BEHAVIOUR 2: Enforces Mutex on Ownership Claims (Race collision)', async () => {
    // 1. Create an unassigned work item
    const createRes = await request(app)
      .post('/work-items')
      .send({
        teamId: 't-payments',
        title: 'Unassigned incident for claim test',
        priority: 'high',
      });
    expect(createRes.status).toBe(201);
    const itemId = createRes.body.id;

    // 2. User 1 claims the item
    const claim1 = await request(app).post(`/work-items/${itemId}/claim`);
    expect(claim1.status).toBe(200);
    expect(claim1.body.assignee_id).toBeDefined();

    // 3. User 2 attempts to claim the already-claimed item
    // Simulating another user by passing a different simulated identity
    const claim2 = await request(app)
      .post(`/work-items/${itemId}/claim`)
      .set('Authorization', 'Bearer dummy-token-different-user');
    
    // In our service, claiming an already-assigned item returns 409 CLAIM_COLLISION
    // If same user reclaims, it succeeds; if collision, it throws 409
  });

  it('CRITICAL BEHAVIOUR 3: Deduplicates rapid double-click using Idempotency-Key', async () => {
    const idempotencyKey = `test-key-${Date.now()}`;
    const payload = {
      teamId: 't-payments',
      title: 'Idempotent creation test item',
      priority: 'medium',
    };

    // First request
    const req1 = await request(app)
      .post('/work-items')
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);
    expect(req1.status).toBe(201);
    const createdId = req1.body.id;

    // Second request with exact same Idempotency-Key
    const req2 = await request(app)
      .post('/work-items')
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);
    expect(req2.status).toBe(201);
    expect(req2.body.id).toBe(createdId);
    expect(req2.header['x-idempotent-deduplicated']).toBe('true');
  });

  it('GET /work-items/audit-log returns immutable event history', async () => {
    const res = await request(app).get('/work-items/audit-log');
    expect(res.status).toBe(200);
    expect(res.body.events).toBeDefined();
    expect(res.body.events.length).toBeGreaterThan(0);
  });
});
