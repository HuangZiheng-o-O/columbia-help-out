import type {
  Task,
  TaskListQuery,
  TaskListResult,
  CreateTaskInput,
} from './taskTypes';

/** Task service interface: contract between frontend and backend. */
export interface TaskService {
  listTasks(query: TaskListQuery): Promise<TaskListResult>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(input: CreateTaskInput): Promise<Task>;
  // Reserved for future features:
  // claimTask(taskId: string): Promise<Task>;
  // completeTask(taskId: string): Promise<Task>;
}

/** Current task service implementation: in-memory mock.
 *  Replace this with a Firebase implementation later, keeping the same interface.
 */
export const taskService: TaskService = createMockTaskService();

function createMockTaskService(): TaskService {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Borrow 45W USB-C charger',
      shortDescription: 'Help me borrow a 45W USB-C charger near Butler Library.',
      category: 'campus',
      credits: 30,
      location: 'Butler Library lobby',
      durationMinutes: 30,
      createdAt: new Date().toISOString(),
      createdByUid: 'mock-user-1',
      publisherEmail: 'jordan@columbia.edu',
      status: 'open',
      isVerified: true,
      urgency: 'urgent',
      tags: ['charger', 'butler'],
    },
    {
      id: '2',
      title: 'Advising session',
      shortDescription: 'Short chat about course and internship choices.',
      category: 'other',
      credits: 30,
      location: 'Mudd building',
      durationMinutes: 20,
      createdAt: new Date().toISOString(),
      createdByUid: 'mock-user-2',
      publisherEmail: 'li.andy@columbia.edu',
      status: 'open',
      isVerified: true,
      urgency: 'flexible',
      tags: ['advice'],
    },
  ];

  return {
    async listTasks(query: TaskListQuery): Promise<TaskListResult> {
      const { searchText, sortBy = 'newest' } = query;

      let tasks = [...mockTasks];

      if (searchText?.trim()) {
        const q = searchText.toLowerCase();
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.location.toLowerCase().includes(q) ||
            t.shortDescription?.toLowerCase().includes(q),
        );
      }

      if (sortBy === 'credits_desc') {
        tasks.sort((a, b) => b.credits - a.credits);
      } else if (sortBy === 'newest') {
        tasks.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }

      return {
        tasks,
        nextCursor: undefined,
      };
    },

    async getTaskById(id: string): Promise<Task | null> {
      return mockTasks.find((t) => t.id === id) ?? null;
    },

    async createTask(input: CreateTaskInput): Promise<Task> {
      const now = new Date();
      const newTask: Task = {
        id: `mock-${now.getTime()}`,
        title: input.title,
        shortDescription: input.shortDescription,
        category: input.category,
        credits: input.credits,
        location: input.location,
        durationMinutes: input.durationMinutes,
        createdAt: now.toISOString(),
        createdByUid: 'mock-user',
        publisherEmail: 'mock-user@columbia.edu',
        status: 'open',
        isVerified: true,
        isOnline: input.isOnline ?? false,
        urgency: input.urgency,
        tags: input.tags ?? [],
      };

      mockTasks.unshift(newTask);
      return newTask;
    },
  };
}
