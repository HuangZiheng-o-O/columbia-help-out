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
  status: TaskStatus;
  isVerified?: boolean;
  isOnline?: boolean;
  urgency?: TaskUrgency;
  tags?: string[];
}

/** Sort options used for task lists. */
export type TaskSortBy = 'newest' | 'nearest' | 'credits_desc';

/** Query parameters for listing tasks. */
export interface TaskListQuery {
  searchText?: string;
  sortBy?: TaskSortBy;
  limit?: number;
  cursor?: string;
}

/** List result structure. */
export interface TaskListResult {
  tasks: Task[];
  nextCursor?: string;
}
