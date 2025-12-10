export type TaskCategory = 'campus' | 'daily' | 'academic' | 'other';
export type TaskUrgency = 'urgent' | 'flexible' | 'normal';
export type TaskStatus = 'open' | 'claimed' | 'completed' | 'cancelled';
export type TaskSortBy = 'newest' | 'nearest' | 'credits_desc';

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

export interface TaskListResult {
  tasks: Task[];
  nextCursor?: string;
}

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
}

export interface UpdateTaskStatusInput {
  taskId: string;
  status: TaskStatus;
  claimedByUid?: string | null;
  completedAt?: string | null;
  cancelledReason?: string;
}


