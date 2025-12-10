import { pool } from './db';
import {
  Task,
  TaskListQuery,
  TaskListResult,
  CreateTaskInput,
  UpdateTaskStatusInput,
  TaskStatus,
} from './taskTypes';

const statusOrder: Record<string, number> = { open: 1, claimed: 2, completed: 3, cancelled: 4 };

function rowToTask(row: any): Task {
  return {
    id: String(row.id),
    title: row.title,
    shortDescription: row.short_description ?? undefined,
    category: row.category,
    credits: row.credits,
    location: row.location,
    durationMinutes: row.duration_minutes,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    createdByUid: row.uid,
    publisherEmail: row.publisher_email ?? undefined,
    status: row.status,
    isVerified: !!row.is_verified,
    isOnline: !!row.is_online,
    urgency: row.urgency ?? undefined,
    tags: [], // will fill later
    claimedByUid: row.claimed_by_uid ?? null,
    claimedAt: row.claimed_at ? new Date(row.claimed_at).toISOString() : null,
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
  };
}

function camelToSnake(s: string) {
  return s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

async function attachTags(tasks: Task[]): Promise<Task[]> {
  if (!tasks.length) return tasks;
  const ids = tasks.map((t) => Number(t.id)).filter((v) => !Number.isNaN(v));
  if (!ids.length) return tasks;
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT task_id, tag FROM task_tags WHERE task_id IN (${placeholders})`,
    ids,
  );
  const tagMap = new Map<number, string[]>();
  for (const r of rows as any[]) {
    const tid = Number(r.task_id);
    if (!tagMap.has(tid)) tagMap.set(tid, []);
    tagMap.get(tid)!.push(r.tag);
  }
  return tasks.map((t) => ({
    ...t,
    tags: tagMap.get(Number(t.id)) ?? [],
  }));
}

export const taskService = {
  async listTasks(query: TaskListQuery): Promise<TaskListResult> {
    const {
      searchText,
      sortBy = 'newest',
      limit = 20,
      cursor,
      ownerUid,
      claimedByUid,
      status,
      scope,
    } = query;

    const params: any[] = [];
    const where: string[] = [];

    if (scope === 'published' && ownerUid) where.push('t.uid = ?'), params.push(ownerUid);
    if (scope === 'claimed' && claimedByUid) where.push('t.claimed_by_uid = ?'), params.push(claimedByUid);
    if (ownerUid && !scope) where.push('t.uid = ?'), params.push(ownerUid);
    if (claimedByUid && !scope) where.push('t.claimed_by_uid = ?'), params.push(claimedByUid);
    if (status) where.push('t.status = ?'), params.push(status);

    if (searchText) {
      where.push('(t.title LIKE ? OR t.location LIKE ? OR t.short_description LIKE ?)');
      const kw = `%${searchText}%`;
      params.push(kw, kw, kw);
    }

    if (cursor) {
      const [ts, id] = cursor.split('_');
      where.push(
        '(t.created_at < FROM_UNIXTIME(?/1000) OR (t.created_at = FROM_UNIXTIME(?/1000) AND t.id < ?))',
      );
      params.push(Number(ts), Number(ts), Number(id));
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    // nearest 未实现，回退为 newest
    const effSort = sortBy === 'nearest' ? 'newest' : sortBy;
    const sortClause =
      effSort === 'credits_desc'
        ? 'ORDER BY t.credits DESC, t.id DESC'
        : 'ORDER BY t.created_at DESC, t.id DESC';

    const sql = `
      SELECT t.*, u.email AS publisher_email
      FROM tasks t
      JOIN users u ON u.uid = t.uid
      ${whereClause}
      ${sortClause}
      LIMIT ?
    `;
    params.push(limit + 1);

    const [rows] = await pool.query(sql, params);
    const rs = rows as any[];
    const tasksRaw = rs.slice(0, limit).map(rowToTask);
    const tasks = await attachTags(tasksRaw);
    const hasMore = rs.length > limit;
    const nextCursor = hasMore
      ? `${new Date(rs[limit - 1].created_at).getTime()}_${rs[limit - 1].id}`
      : undefined;

    return { tasks, nextCursor };
  },

  async getTaskById(id: string): Promise<Task | null> {
    const [rows] = await pool.query(
      `SELECT t.*, u.email AS publisher_email FROM tasks t JOIN users u ON u.uid = t.uid WHERE t.id = ? LIMIT 1`,
      [id],
    );
    const rs = rows as any[];
    if (!rs.length) return null;
    const task = rowToTask(rs[0]);
    const withTags = await attachTags([task]);
    return withTags[0] ?? task;
  },

  async createTask(
    input: CreateTaskInput,
    currentUid: string,
    currentEmail: string,
    emailVerified: boolean,
  ): Promise<Task> {
    const [result] = await pool.query(
      `INSERT INTO tasks (uid, title, short_description, category, credits, location, duration_minutes, status, is_verified, is_online, urgency, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, NOW(), NOW())`,
      [
        currentUid,
        input.title,
        input.shortDescription,
        input.category,
        input.credits,
        input.location,
        input.durationMinutes,
        emailVerified ? 1 : 0,
        input.isOnline ? 1 : 0,
        input.urgency ?? null,
      ],
    );
    const insertId = (result as any).insertId as number;

    if (input.tags?.length) {
      const values = input.tags.map((tag) => [insertId, tag]);
      await pool.query(`INSERT INTO task_tags (task_id, tag) VALUES ?`, [values]);
    }

    const task = await this.getTaskById(String(insertId));
    if (!task) throw new Error('Failed to fetch created task');
    return task;
  },

  async updateTaskStatus(input: UpdateTaskStatusInput, actorUid: string): Promise<Task> {
    const existing = await this.getTaskById(input.taskId);
    if (!existing) throw new Error('Task not found');

    if (existing.status === 'completed' || existing.status === 'cancelled') {
      throw new Error('Task already closed');
    }
    if (input.status === 'claimed' && existing.claimedByUid) {
      throw new Error('Task already claimed');
    }
    if (input.status === 'cancelled' && existing.createdByUid !== actorUid && existing.claimedByUid !== actorUid) {
      throw new Error('Not allowed to cancel');
    }

    const patch: any = { status: input.status, updated_at: new Date() };
    if (input.status === 'claimed') {
      patch.claimed_by_uid = input.claimedByUid ?? actorUid;
      patch.claimed_at = new Date();
    }
    if (input.status === 'completed') {
      patch.completed_at = input.completedAt ? new Date(input.completedAt) : new Date();
    }
    if (input.status === 'cancelled') {
      patch.claimed_by_uid = null;
      patch.claimed_at = null;
    }

    const sqlSet = Object.keys(patch)
      .map((k) => `${camelToSnake(k)} = ?`)
      .join(', ');
    const values = Object.values(patch);
    values.push(input.taskId);

    await pool.query(`UPDATE tasks SET ${sqlSet} WHERE id = ?`, values);
    const updated = await this.getTaskById(input.taskId);
    if (!updated) throw new Error('Task not found after update');
    return updated;
  },
};

