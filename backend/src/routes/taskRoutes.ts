import { Router } from 'express';
import { z } from 'zod';
import { taskService } from '../taskService';

const router = Router();

const listQuery = z.object({
  searchText: z.string().optional(),
  sortBy: z.enum(['newest', 'nearest', 'credits_desc']).optional(),
  limit: z.coerce.number().optional(),
  cursor: z.string().optional(),
  ownerUid: z.string().optional(),
  claimedByUid: z.string().optional(),
  status: z.enum(['open', 'claimed', 'completed', 'cancelled']).optional(),
  scope: z.enum(['all', 'published', 'claimed']).optional(),
});

router.get('/', async (req, res) => {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = await taskService.listTasks(parsed.data);
  res.json(data);
});

const createBody = z.object({
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  category: z.enum(['campus', 'daily', 'academic', 'other']),
  credits: z.number().positive(),
  location: z.string().min(1),
  durationMinutes: z.number().positive(),
  isOnline: z.boolean().optional(),
  urgency: z.enum(['urgent', 'flexible', 'normal']).optional(),
  tags: z.array(z.string()).optional(),
});

router.post('/', async (req, res) => {
  const parsed = createBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  // TODO: replace with authenticated user uid
  const currentUid = 'mock-user-1';
  const currentEmail = 'jordan@columbia.edu';
  const emailVerified = true;
  const data = await taskService.createTask(parsed.data, currentUid, currentEmail, emailVerified);
  res.status(201).json(data);
});

const statusBody = z.object({
  status: z.enum(['open', 'claimed', 'completed', 'cancelled']),
  claimedByUid: z.string().nullable().optional(),
  completedAt: z.string().optional(),
  cancelledReason: z.string().optional(),
});

router.post('/:id/updateStatus', async (req, res) => {
  const parsed = statusBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  // TODO: replace with authenticated user uid
  const actorUid = 'mock-user-1';
  try {
    const data = await taskService.updateTaskStatus(
      { taskId: req.params.id, ...parsed.data },
      actorUid,
    );
    res.json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.message ?? 'Update failed' });
  }
});

router.get('/:id', async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});

export default router;

