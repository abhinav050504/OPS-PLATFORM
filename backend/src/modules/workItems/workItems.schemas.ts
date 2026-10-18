import { z } from 'zod';

export const createWorkItemSchema = z.object({
  teamId: z.string().min(1, 'teamId is required'),
  title: z.string().min(1, 'title is required').max(200),
  description: z.string().default(''),
  priority: z.string().default('medium'),
  nextActionRequired: z.string().optional(),
  requiresApproval: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const updateWorkItemSchema = z.object({
  expectedVersion: z.number().int({ message: 'expectedVersion is required for concurrency control' }),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  nextActionRequired: z.string().optional(),
  reason: z.string().optional(),
});

export const approvalSchema = z.object({
  expectedVersion: z.number().int(),
  decision: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().optional(),
});

export const addCommentSchema = z.object({
  body: z.string().min(1, 'Comment body cannot be empty').max(5000),
  isDecision: z.boolean().default(false),
});
