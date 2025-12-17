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
import { userService } from './userService';
import { transactionService } from './transactionService';

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
    publisherName: data.publisherName ?? undefined,
    status: data.status ?? 'open',
    isVerified: data.isVerified ?? false,
    isOnline: data.isOnline ?? false,
    tags: data.tags ?? [],
    claimedByUid: data.claimedByUid ?? null,
    claimerName: data.claimerName ?? null,
    claimerEmail: data.claimerEmail ?? null,
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

      // Note: For 'published' scope, we use client-side filtering to avoid index requirement
      let filterByOwnerUid = null;
      let filterByStatus = null;

      if (scope === 'published') {
        if (!ownerUid) return { tasks: [], nextCursor: undefined };
        filterByOwnerUid = ownerUid;
      } else if (ownerUid) {
        filterByOwnerUid = ownerUid;
      }

      // Use client-side status filtering to avoid composite index requirement
      if (status) {
        filterByStatus = status;
      }

      // Always sort by createdAt in Firestore, do other sorting client-side
      constraints.push(orderBy('createdAt', 'desc'));

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

        // Client-side status filter (to avoid composite index requirement)
        if (filterByStatus) {
          tasks = tasks.filter((t) => t.status === filterByStatus);
        }

        // Client-side owner filter (to avoid composite index requirement)
        if (filterByOwnerUid) {
          tasks = tasks.filter((t) => t.createdByUid === filterByOwnerUid);
        }

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

        // Client-side sorting
        if (sortBy === 'credits_desc') {
          tasks.sort((a, b) => b.credits - a.credits);
        } else if (sortBy === 'duration_asc') {
          tasks.sort((a, b) => a.durationMinutes - b.durationMinutes);
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
     * Create a new task (with credit locking)
     * @param {object} input
     * @returns {Promise<object>}
     */
    async createTask(input) {
      try {
        // Ensure user exists and has enough credits
        await userService.getOrCreateUser(
          input.createdByUid,
          input.publisherEmail,
          input.publisherName || 'User'
        );

        // Lock credits for this task
        await userService.lockCredits(input.createdByUid, input.credits);

        const docData = {
          title: input.title,
          shortDescription: input.shortDescription,
          category: input.category,
          credits: input.credits,
          location: input.location,
          durationMinutes: input.durationMinutes,
          isOnline: input.isOnline ?? false,
          tags: input.tags ?? [],
          createdByUid: input.createdByUid,
          publisherEmail: input.publisherEmail,
          publisherName: input.publisherName || 'User',
          isVerified: true,
          status: 'open',
          claimedByUid: null,
          claimerName: null,
          claimerEmail: null,
          claimedAt: null,
          completedAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(tasksCollection, docData);
        
        const created = await this.getTaskById(docRef.id);
        if (!created) throw new Error('Failed to fetch created task');

        // Record transaction
        await transactionService.recordTaskPublished(
          input.createdByUid,
          docRef.id,
          input.title,
          input.credits
        );

        return created;
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    },

    /**
     * Update task status (with credit management)
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
          updates.claimerName = input.claimerName || 'User';
          updates.claimerEmail = input.claimerEmail || null;
          updates.claimedAt = serverTimestamp();

          // Ensure claimer has a user record
          if (input.claimedByUid && input.claimerEmail) {
            await userService.getOrCreateUser(
              input.claimedByUid,
              input.claimerEmail,
              input.claimerName || 'User'
            );
          }
        }

        if (input.status === 'completed') {
          updates.completedAt = serverTimestamp();

          // Transfer credits from publisher to claimer
          if (existing.claimedByUid && existing.createdByUid) {
            await userService.transferCredits(
              existing.createdByUid,
              existing.claimedByUid,
              existing.credits
            );

            // Record transactions for both parties
            await transactionService.recordTaskCompletedPublisher(
              existing.createdByUid,
              input.taskId,
              existing.title,
              existing.credits
            );
            await transactionService.recordTaskCompletedClaimer(
              existing.claimedByUid,
              input.taskId,
              existing.title,
              existing.credits
            );
          }
        }

        if (input.status === 'cancelled') {
          // Unlock credits back to publisher
          await userService.unlockCredits(existing.createdByUid, existing.credits);

          // Record unlock transaction
          await transactionService.recordTaskCancelled(
            existing.createdByUid,
            input.taskId,
            existing.title,
            existing.credits
          );

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

