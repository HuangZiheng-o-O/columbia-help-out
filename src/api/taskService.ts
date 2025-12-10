import type {
  Task,
  TaskListQuery,
  TaskListResult,
  CreateTaskInput,
  UpdateTaskStatusInput,
} from './taskTypes';

/** Task service interface: contract between frontend and backend. */
export interface TaskService {
  listTasks(query: TaskListQuery): Promise<TaskListResult>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTaskStatus(input: UpdateTaskStatusInput): Promise<Task>;
}

/** Active service: HTTP client to backend (removes all frontend mocks). */
export const taskService: TaskService = createHttpTaskService();

function createHttpTaskService(): TaskService {
  const baseUrl =
    // Vite env for frontend builds
    (import.meta as any).env?.VITE_API_BASE ??
    // fallback for local dev
    'http://localhost:4000';

  async function handleJson<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed: ${response.status}`);
    }
    return (await response.json()) as T;
  }

  return {
    async listTasks(query: TaskListQuery): Promise<TaskListResult> {
      const params = new URLSearchParams();
      if (query.searchText) params.set('searchText', query.searchText);
      if (query.sortBy) params.set('sortBy', query.sortBy);
      if (query.limit) params.set('limit', String(query.limit));
      if (query.cursor) params.set('cursor', query.cursor);
      if (query.ownerUid) params.set('ownerUid', query.ownerUid);
      if (query.claimedByUid) params.set('claimedByUid', query.claimedByUid);
      if (query.status) params.set('status', query.status);
      if (query.scope) params.set('scope', query.scope);

      const res = await fetch(`${baseUrl}/tasks?${params.toString()}`, {
        method: 'GET',
      });
      return handleJson<TaskListResult>(res);
    },

    async getTaskById(id: string): Promise<Task | null> {
      const res = await fetch(`${baseUrl}/tasks/${id}`, { method: 'GET' });
      if (res.status === 404) return null;
      return handleJson<Task>(res);
    },

    async createTask(input: CreateTaskInput): Promise<Task> {
      const res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      return handleJson<Task>(res);
    },

    async updateTaskStatus(input: UpdateTaskStatusInput): Promise<Task> {
      const res = await fetch(`${baseUrl}/tasks/${input.taskId}/updateStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: input.status,
          claimedByUid: input.claimedByUid,
          completedAt: input.completedAt,
          cancelledReason: input.cancelledReason,
        }),
      });
      return handleJson<Task>(res);
    },
  };
}
