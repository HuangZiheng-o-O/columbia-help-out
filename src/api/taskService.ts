import type {
  Task,
  TaskListQuery,
  TaskListResult,
  CreateTaskInput,
  UpdateTaskStatusInput,
} from './taskTypes';
import { initialMockTasks } from './mockData';

/** Task service interface: contract between frontend and backend. */
export interface TaskService {
  listTasks(query: TaskListQuery): Promise<TaskListResult>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTaskStatus(input: UpdateTaskStatusInput): Promise<Task>;
}

// In-memory task store (persists during session)
let tasks: Task[] = [...initialMockTasks];
let nextId = 100;

// Current mock user
const CURRENT_USER_UID = 'mock-user-1';
const CURRENT_USER_EMAIL = 'jordan@columbia.edu';

/** Mock task service implementation using local state */
function createMockTaskService(): TaskService {
  return {
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

      // Start with all tasks
      let filtered = [...tasks];

      // Scope filters
      if (scope === 'published') {
        if (!ownerUid) return { tasks: [], nextCursor: undefined };
        filtered = filtered.filter((t) => t.createdByUid === ownerUid);
      } else if (scope === 'claimed') {
        if (!claimedByUid) return { tasks: [], nextCursor: undefined };
        filtered = filtered.filter((t) => t.claimedByUid === claimedByUid);
      } else {
        if (ownerUid) {
          filtered = filtered.filter((t) => t.createdByUid === ownerUid);
        }
        if (claimedByUid) {
          filtered = filtered.filter((t) => t.claimedByUid === claimedByUid);
        }
      }

      // Status filter
      if (status) {
        filtered = filtered.filter((t) => t.status === status);
      }

      // Search filter
      if (searchText) {
        const lower = searchText.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(lower) ||
            t.location.toLowerCase().includes(lower) ||
            t.shortDescription?.toLowerCase().includes(lower)
        );
      }

      // Sorting
      if (sortBy === 'credits_desc') {
        filtered.sort((a, b) => b.credits - a.credits);
      } else {
        // newest (default)
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      // Pagination with cursor
      let startIndex = 0;
      if (cursor) {
        const [ts, id] = cursor.split('_');
        const cursorTime = Number(ts);
        const cursorId = id;
        startIndex = filtered.findIndex(
          (t) =>
            new Date(t.createdAt).getTime() < cursorTime ||
            (new Date(t.createdAt).getTime() === cursorTime && t.id <= cursorId)
        );
        if (startIndex === -1) startIndex = filtered.length;
      }

      const page = filtered.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < filtered.length;
      const lastTask = page[page.length - 1];
      const nextCursor = hasMore && lastTask
        ? `${new Date(lastTask.createdAt).getTime()}_${lastTask.id}`
        : undefined;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return { tasks: page, nextCursor };
    },

    async getTaskById(id: string): Promise<Task | null> {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return tasks.find((t) => t.id === id) ?? null;
    },

    async createTask(input: CreateTaskInput): Promise<Task> {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const newTask: Task = {
        id: String(nextId++),
        title: input.title,
        shortDescription: input.shortDescription,
        category: input.category,
        credits: input.credits,
        location: input.location,
        durationMinutes: input.durationMinutes,
        isOnline: input.isOnline ?? false,
        urgency: input.urgency ?? 'normal',
        tags: input.tags ?? [],
        createdAt: new Date().toISOString(),
        createdByUid: CURRENT_USER_UID,
        publisherEmail: CURRENT_USER_EMAIL,
        status: 'open',
        isVerified: true,
        claimedByUid: null,
        claimedAt: null,
        completedAt: null,
      };

      tasks.unshift(newTask);
      return newTask;
    },

    async updateTaskStatus(input: UpdateTaskStatusInput): Promise<Task> {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const taskIndex = tasks.findIndex((t) => t.id === input.taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const existing = tasks[taskIndex];

      if (existing.status === 'completed' || existing.status === 'cancelled') {
        throw new Error('Task already closed');
      }

      if (input.status === 'claimed' && existing.claimedByUid) {
        throw new Error('Task already claimed');
      }

      const updated: Task = { ...existing };
      updated.status = input.status;

      if (input.status === 'claimed') {
        updated.claimedByUid = input.claimedByUid ?? CURRENT_USER_UID;
        updated.claimedAt = new Date().toISOString();
      }

      if (input.status === 'completed') {
        updated.completedAt = input.completedAt ?? new Date().toISOString();
      }

      if (input.status === 'cancelled') {
        // If publisher cancels, clear the claim
        if (existing.createdByUid === CURRENT_USER_UID) {
          updated.claimedByUid = null;
          updated.claimedAt = null;
        }
      }

      tasks[taskIndex] = updated;
      return updated;
    },
  };
}

/** Active service: Mock implementation for demo purposes */
export const taskService: TaskService = createMockTaskService();
