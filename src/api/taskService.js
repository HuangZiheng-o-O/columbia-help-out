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
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Convert Firestore document to Task object
 * @param {string} id
 * @param {object} data
 * @returns {object}
 */
function firestoreDocToTask(id, data) {
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

/**
 * Create Firestore task service
 */
function createFirestoreTaskService() {
  const tasksCollection = collection(db, 'tasks');

  /**
   * List claimed tasks using client-side filtering
   */
  async function listClaimedTasksClientSide(claimedByUid, searchText, pageSize = 20) {
    try {
      const q = query(tasksCollection, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      let tasks = snap.docs
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

      return { tasks: tasks.slice(0, pageSize), nextCursor: undefined };
    } catch (error) {
      console.error('Error fetching claimed tasks:', error);
      throw error;
    }
  }

  return {
    /**
     * List tasks
     * @param {object} queryInput
     * @returns {Promise<{tasks: object[], nextCursor?: string}>}
     */
    async listTasks(queryInput) {
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

      // For 'claimed' scope, use client-side filtering
      if (scope === 'claimed' && claimedByUid) {
        return listClaimedTasksClientSide(claimedByUid, searchText, pageSize);
      }

      const constraints = [];

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
        constraints.push(orderBy('createdAt', 'desc'));
      }

      // Pagination
      if (cursor) {
        const [createdAtMillis] = cursor.split('_');
        const createdAt = Timestamp.fromMillis(Number(createdAtMillis));
        constraints.push(startAfter(createdAt));
      }

      constraints.push(limit(pageSize + 1));

      try {
        const q = query(tasksCollection, ...constraints);
        const snap = await getDocs(q);

        let tasks = snap.docs.slice(0, pageSize).map((doc) =>
          firestoreDocToTask(doc.id, doc.data())
        );

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

        // Calculate next cursor
        let nextCursor;
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

    /**
     * Get task by ID
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    async getTaskById(id) {
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

    /**
     * Create a new task
     * @param {object} input
     * @returns {Promise<object>}
     */
    async createTask(input) {
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
        
        const created = await this.getTaskById(docRef.id);
        if (!created) throw new Error('Failed to fetch created task');
        return created;
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    },

    /**
     * Update task status
     * @param {object} input
     * @returns {Promise<object>}
     */
    async updateTaskStatus(input) {
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

        const updates = {
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

/** Active service instance */
export const taskService = createFirestoreTaskService();

