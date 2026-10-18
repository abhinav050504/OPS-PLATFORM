import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { validateBody } from '../../shared/validate';
import { requireAuth } from '../auth/auth.middleware';
import { idempotencyMiddleware } from '../../shared/idempotency';
import {
  createWorkItemSchema,
  updateWorkItemSchema,
  approvalSchema,
  addCommentSchema,
} from './workItems.schemas';
import * as workItemsService from './workItems.service';

export const workItemsRouter = Router();

// Apply idempotency middleware to all mutating routes
workItemsRouter.use(idempotencyMiddleware());

// GET /work-items (filters: teamId, status, priority, assigneeId, q)
workItemsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const filters = {
      teamId: req.query.teamId as string | undefined,
      status: req.query.status as string | undefined,
      priority: req.query.priority as string | undefined,
      assigneeId: req.query.assigneeId as string | undefined,
      q: req.query.q as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : 25,
    };
    const result = await workItemsService.listWorkItems(filters);
    res.json(result);
  })
);

// GET /work-items/audit-log (Global activity trail)
workItemsRouter.get(
  '/audit-log',
  asyncHandler(async (_req, res) => {
    const result = await workItemsService.getGlobalActivityLog();
    res.json({ events: result });
  })
);

// GET /work-items/:id
workItemsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await workItemsService.getWorkItemById(req.params.id as string);
    res.json(item);
  })
);

const getUserId = (req: any) => (req.headers['x-user-id'] as string) || req.user?.id || 'u-sarah';

// POST /work-items (Create new work item)
workItemsRouter.post(
  '/',
  validateBody(createWorkItemSchema),
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const item = await workItemsService.createWorkItem(userId, req.body);
    res.status(201).json(item);
  })
);

// PATCH /work-items/:id (OCC Version Check + Update)
workItemsRouter.patch(
  '/:id',
  validateBody(updateWorkItemSchema),
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const item = await workItemsService.updateWorkItem(userId, req.params.id as string, req.body);
    res.json(item);
  })
);

// POST /work-items/:id/claim (Atomic Ownership Mutex)
workItemsRouter.post(
  '/:id/claim',
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const item = await workItemsService.claimWorkItem(userId, req.params.id as string);
    res.json(item);
  })
);

// POST /work-items/:id/approval (Operational Approval Gate)
workItemsRouter.post(
  '/:id/approval',
  validateBody(approvalSchema),
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const item = await workItemsService.approveWorkItem(userId, req.params.id as string, req.body);
    res.json(item);
  })
);

// POST /work-items/:id/comments
workItemsRouter.post(
  '/:id/comments',
  validateBody(addCommentSchema),
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const item = await workItemsService.addComment(
      userId,
      req.params.id as string,
      req.body.body,
      req.body.isDecision
    );
    res.status(201).json(item);
  })
);
