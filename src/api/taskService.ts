import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/config';
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


/** Convert Firestore document to Task object */
function firestoreDocToTask(id: string, data: any): Task {
  return {
    id,
    title: data.title ?? '',
    shortDescription: data.shortDescription ?? undefined,
    category: data.category ?? 'other',
    credits: data.credits ?? 0,
    location: data.location ?? '',
    durationMinutes: data.durationMinutes ?? 0,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
    createdByUid: data.createdByUid ?? '',
    publisherEmail: data.publisherEmail ?? undefined,
    status: data.status ?? 'open',
    isVerified: data.isVerified ?? false,
    isOnline: data.isOnline ?? false,
    urgency: data.urgency ?? undefined,
    tags: data.tags ?? [],
    claimedByUid: data.claimedByUid ?? null,
    claimedAt: data.claimedAt?.toDate?.().toISOString() ?? null,
    completedAt: data.completedAt?.toDate?.().toISOString() ?? null,
  };
}

/** Firestore-based task service implementation */
function createFirestoreTaskService(): TaskService {
  const tasksCollection = collection(db, 'tasks');

  // Helper function to load claimed tasks using client-side filtering
  // This avoids needing a composite index for claimedByUid + createdAt
  async function listClaimedTasksClientSide(
    claimedByUid: string,
    searchText?: string,
    pageSize: number = 20
  ): Promise<TaskListResult> {
    try {
      // Get all tasks and filter client-side
      const q = query(tasksCollection, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      let tasks: Task[] = snap.docs
        .map((doc) => firestoreDocToTask(doc.id, doc.data()))
        .filter((t) => t.claimedByUid === claimedByUid);

      // Client-side search filter
      if (searchText) {
        const lower = searchText.toLowerCase();
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(lower) ||
            t.location.toLowerCase().includes(lower) ||
            t.shortDescription?.toLowerCase().includes(lower)
        );
      }

      // Limit results
      const limitedTasks = tasks.slice(0, pageSize);

      return { tasks: limitedTasks, nextCursor: undefined };
    } catch (error) {
      console.error('Error fetching claimed tasks:', error);
      throw error;
    }
  }

  return {
    async listTasks(queryInput: TaskListQuery): Promise<TaskListResult> {
      const {
        searchText,
        sortBy = 'newest',
        limit: pageSize = 20,
        cursor,
        ownerUid,
        claimedByUid,
        status,
        scope,
      } = queryInput;

      // For 'claimed' scope, use client-side filtering to avoid needing composite index
      if (scope === 'claimed' && claimedByUid) {
        return listClaimedTasksClientSide(claimedByUid, searchText, pageSize);
      }

      const constraints: QueryConstraint[] = [];

      // Scope filters
      if (scope === 'published') {
        if (!ownerUid) return { tasks: [], nextCursor: undefined };
        constraints.push(where('createdByUid', '==', ownerUid));
      } else {
        if (ownerUid) {
          constraints.push(where('createdByUid', '==', ownerUid));
        }
      }

      // Status filter
      if (status) {
        constraints.push(where('status', '==', status));
      }

      // Sorting
      if (sortBy === 'credits_desc') {
        constraints.push(orderBy('credits', 'desc'));
        constraints.push(orderBy('createdAt', 'desc'));
      } else {
        // newest (default)
        constraints.push(orderBy('createdAt', 'desc'));
      }

      // Pagination with cursor
      if (cursor) {
        const [createdAtMillis] = cursor.split('_');
        const createdAt = Timestamp.fromMillis(Number(createdAtMillis));
        constraints.push(startAfter(createdAt));
      }

      // Limit
      constraints.push(limit(pageSize + 1));

      try {
        const q = query(tasksCollection, ...constraints);
        const snap = await getDocs(q);

        let tasks: Task[] = snap.docs.slice(0, pageSize).map((doc) =>
          firestoreDocToTask(doc.id, doc.data())
        );

        // Client-side search filter (Firestore doesn't support full-text search natively)
        if (searchText) {
          const lower = searchText.toLowerCase();
          tasks = tasks.filter(
            (t) =>
              t.title.toLowerCase().includes(lower) ||
              t.location.toLowerCase().includes(lower) ||
              t.shortDescription?.toLowerCase().includes(lower)
          );
        }

        // Calculate next cursor
        let nextCursor: string | undefined;
        if (snap.docs.length > pageSize) {
          const lastDoc = snap.docs[pageSize - 1];
          const data = lastDoc.data();
          if (data.createdAt) {
            nextCursor = `${data.createdAt.toMillis()}_${lastDoc.id}`;
          }
        }

        return { tasks, nextCursor };
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
    },

    async getTaskById(id: string): Promise<Task | null> {
      try {
        const docRef = doc(db, 'tasks', id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;
        return firestoreDocToTask(snap.id, snap.data());
      } catch (error) {
        console.error('Error fetching task:', error);
        throw error;
      }
    },

    async createTask(input: CreateTaskInput): Promise<Task> {
      try {
        const docData = {
          title: input.title,
          shortDescription: input.shortDescription,
          category: input.category,
          credits: input.credits,
          location: input.location,
          durationMinutes: input.durationMinutes,
          isOnline: input.isOnline ?? false,
          urgency: input.urgency ?? 'normal',
          tags: input.tags ?? [],
          createdByUid: input.createdByUid,
          publisherEmail: input.publisherEmail,
          isVerified: true,
          status: 'open',
          claimedByUid: null,
          claimedAt: null,
          completedAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(tasksCollection, docData);
        
        // Fetch the created document to return complete task
        const created = await this.getTaskById(docRef.id);
        if (!created) throw new Error('Failed to fetch created task');
        return created;
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    },

    async updateTaskStatus(input: UpdateTaskStatusInput): Promise<Task> {
      try {
        const docRef = doc(db, 'tasks', input.taskId);
        const existing = await this.getTaskById(input.taskId);
        if (!existing) throw new Error('Task not found');

        if (existing.status === 'completed' || existing.status === 'cancelled') {
          throw new Error('Task already closed');
        }

        if (input.status === 'claimed' && existing.claimedByUid) {
          throw new Error('Task already claimed');
        }

        const updates: Record<string, any> = {
          status: input.status,
          updatedAt: serverTimestamp(),
        };

        if (input.status === 'claimed') {
          updates.claimedByUid = input.claimedByUid;
          updates.claimedAt = serverTimestamp();
        }

        if (input.status === 'completed') {
          updates.completedAt = serverTimestamp();
        }

        if (input.status === 'cancelled') {
          // If publisher cancels, clear the claim
          if (input.currentUserUid && existing.createdByUid === input.currentUserUid) {
            updates.claimedByUid = null;
            updates.claimedAt = null;
          }
        }

        await updateDoc(docRef, updates);
        
        const updated = await this.getTaskById(input.taskId);
        if (!updated) throw new Error('Task not found after update');
        return updated;
      } catch (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
    },
  };
}

/** Active service: Firestore implementation */
export const taskService: TaskService = createFirestoreTaskService();
