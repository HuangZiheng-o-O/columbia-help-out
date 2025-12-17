import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Transaction types
 * - 'lock': Credits locked when publishing a task
 * - 'unlock': Credits unlocked when task is cancelled/withdrawn
 * - 'spend': Credits spent (transferred to claimer) when task completed
 * - 'earn': Credits earned when completing a claimed task
 * - 'bonus': Bonus credits (referral, etc.)
 */

/**
 * Create a transaction record
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function createTransaction({
  userId,
  taskId,
  taskTitle,
  type,
  amount,
  status = 'completed',
}) {
  const transactionsRef = collection(db, 'transactions');

  const txData = {
    userId,
    taskId: taskId || null,
    taskTitle: taskTitle || '',
    type,
    amount,
    status,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(transactionsRef, txData);
  return { id: docRef.id, ...txData };
}

/**
 * Get transactions for a user (using client-side filtering to avoid index requirement)
 * @param {string} userId
 * @param {number} pageSize
 * @returns {Promise<object[]>}
 */
export async function getTransactionsByUser(userId, pageSize = 50) {
  const transactionsRef = collection(db, 'transactions');

  // Use simple query without composite index requirement
  const q = query(transactionsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  // Client-side filtering
  const userTransactions = snap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        taskId: data.taskId,
        taskTitle: data.taskTitle,
        type: data.type,
        amount: data.amount,
        status: data.status,
        createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
      };
    })
    .filter((tx) => tx.userId === userId)
    .slice(0, pageSize);

  return userTransactions;
}

/**
 * Record task publication (lock credits)
 * @param {string} userId
 * @param {string} taskId
 * @param {string} taskTitle
 * @param {number} credits
 */
export async function recordTaskPublished(userId, taskId, taskTitle, credits) {
  return createTransaction({
    userId,
    taskId,
    taskTitle,
    type: 'lock',
    amount: -credits,
    status: 'pending',
  });
}

/**
 * Record task cancelled/withdrawn (unlock credits)
 * @param {string} userId
 * @param {string} taskId
 * @param {string} taskTitle
 * @param {number} credits
 */
export async function recordTaskCancelled(userId, taskId, taskTitle, credits) {
  return createTransaction({
    userId,
    taskId,
    taskTitle,
    type: 'unlock',
    amount: credits,
    status: 'completed',
  });
}

/**
 * Record task completed - publisher side (spend)
 * @param {string} publisherId
 * @param {string} taskId
 * @param {string} taskTitle
 * @param {number} credits
 */
export async function recordTaskCompletedPublisher(publisherId, taskId, taskTitle, credits) {
  return createTransaction({
    userId: publisherId,
    taskId,
    taskTitle,
    type: 'spend',
    amount: -credits,
    status: 'completed',
  });
}

/**
 * Record task completed - claimer side (earn)
 * @param {string} claimerId
 * @param {string} taskId
 * @param {string} taskTitle
 * @param {number} credits
 */
export async function recordTaskCompletedClaimer(claimerId, taskId, taskTitle, credits) {
  return createTransaction({
    userId: claimerId,
    taskId,
    taskTitle,
    type: 'earn',
    amount: credits,
    status: 'completed',
  });
}

export const transactionService = {
  createTransaction,
  getTransactionsByUser,
  recordTaskPublished,
  recordTaskCancelled,
  recordTaskCompletedPublisher,
  recordTaskCompletedClaimer,
};

