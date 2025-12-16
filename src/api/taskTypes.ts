/** Task category */
export type TaskCategory = 'campus' | 'daily' | 'academic' | 'other';

/** Task urgency level */
export type TaskUrgency = 'urgent' | 'flexible' | 'normal';

/** Task status */
export type TaskStatus = 'open' | 'claimed' | 'completed' | 'cancelled';

/** Frontend Task model, aligned with Firestore documents. */
export interface Task {
  id: string;
  title: string;
  shortDescription?: string;
  category: TaskCategory;
  credits: number;
  location: string;
  durationMinutes: number;
  createdAt: string;
  createdByUid: string;
  publisherEmail?: string;
  status: TaskStatus;
  isVerified?: boolean;
  isOnline?: boolean;
  urgency?: TaskUrgency;
  tags?: string[];
  claimedByUid?: string | null;
  claimedAt?: string | null;
  completedAt?: string | null;
}

/** Sort options used for task lists. */
export type TaskSortBy = 'newest' | 'nearest' | 'credits_desc';

/** Query parameters for listing tasks. */
export interface TaskListQuery {
  searchText?: string;
  sortBy?: TaskSortBy;
  limit?: number;
  cursor?: string;
  ownerUid?: string;
  claimedByUid?: string;
  status?: TaskStatus;
  scope?: 'all' | 'published' | 'claimed';
}

/** List result structure. */
export interface TaskListResult {
  tasks: Task[];
  nextCursor?: string;
}

export interface UpdateTaskStatusInput {
  taskId: string;
  status: TaskStatus;
  claimedByUid?: string | null;
  completedAt?: string | null;
  cancelledReason?: string;
  // Current user performing the action (for permission checks)
  currentUserUid?: string;
}

/** Payload for creating a new task. */
export interface CreateTaskInput {
  title: string;
  shortDescription: string;
  category: TaskCategory;
  credits: number;
  location: string;
  durationMinutes: number;
  isOnline?: boolean;
  urgency?: TaskUrgency;
  tags?: string[];
  // User info for task creation
  createdByUid: string;
  publisherEmail: string;
}
