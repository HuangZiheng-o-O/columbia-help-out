import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const INITIAL_BALANCE = 100; // New users start with 100 credits

/**
 * Get or create user profile with credit balance
 * @param {string} uid
 * @param {string} email
 * @param {string} displayName
 * @returns {Promise<object>}
 */
export async function getOrCreateUser(uid, email, displayName) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: uid, ...userSnap.data() };
  }

  // Create new user with initial balance
  const newUser = {
    email,
    displayName,
    availableBalance: INITIAL_BALANCE,
    lockedBalance: 0,
    totalEarned: 0,
    totalSpent: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, newUser);
  return { id: uid, ...newUser, availableBalance: INITIAL_BALANCE };
}

/**
 * Get user by UID
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function getUserById(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return { id: uid, ...userSnap.data() };
}

/**
 * Get user's credit balance
 * @param {string} uid
 * @returns {Promise<{availableBalance: number, lockedBalance: number}>}
 */
export async function getUserBalance(uid) {
  const user = await getUserById(uid);
  if (!user) {
    return { availableBalance: 0, lockedBalance: 0 };
  }
  return {
    availableBalance: user.availableBalance ?? 0,
    lockedBalance: user.lockedBalance ?? 0,
  };
}

/**
 * Lock credits when publishing a task
 * @param {string} uid
 * @param {number} amount
 * @returns {Promise<boolean>}
 */
export async function lockCredits(uid, amount) {
  const userRef = doc(db, 'users', uid);
  const user = await getUserById(uid);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.availableBalance < amount) {
    throw new Error('Insufficient credits');
  }

  await updateDoc(userRef, {
    availableBalance: user.availableBalance - amount,
    lockedBalance: (user.lockedBalance ?? 0) + amount,
    updatedAt: serverTimestamp(),
  });

  return true;
}

/**
 * Unlock credits when task is cancelled/withdrawn
 * @param {string} uid
 * @param {number} amount
 * @returns {Promise<boolean>}
 */
export async function unlockCredits(uid, amount) {
  const userRef = doc(db, 'users', uid);
  const user = await getUserById(uid);

  if (!user) {
    throw new Error('User not found');
  }

  const currentLocked = user.lockedBalance ?? 0;
  const unlockAmount = Math.min(amount, currentLocked);

  await updateDoc(userRef, {
    availableBalance: user.availableBalance + unlockAmount,
    lockedBalance: currentLocked - unlockAmount,
    updatedAt: serverTimestamp(),
  });

  return true;
}

/**
 * Transfer credits from publisher to claimer when task is completed
 * @param {string} publisherUid
 * @param {string} claimerUid
 * @param {number} amount
 * @returns {Promise<boolean>}
 */
export async function transferCredits(publisherUid, claimerUid, amount) {
  const publisherRef = doc(db, 'users', publisherUid);
  const claimerRef = doc(db, 'users', claimerUid);

  const publisher = await getUserById(publisherUid);
  const claimer = await getUserById(claimerUid);

  if (!publisher || !claimer) {
    throw new Error('User not found');
  }

  const currentLocked = publisher.lockedBalance ?? 0;
  const transferAmount = Math.min(amount, currentLocked);

  // Deduct from publisher's locked balance
  await updateDoc(publisherRef, {
    lockedBalance: currentLocked - transferAmount,
    totalSpent: (publisher.totalSpent ?? 0) + transferAmount,
    updatedAt: serverTimestamp(),
  });

  // Add to claimer's available balance
  await updateDoc(claimerRef, {
    availableBalance: (claimer.availableBalance ?? 0) + transferAmount,
    totalEarned: (claimer.totalEarned ?? 0) + transferAmount,
    updatedAt: serverTimestamp(),
  });

  return true;
}

export const userService = {
  getOrCreateUser,
  getUserById,
  getUserBalance,
  lockCredits,
  unlockCredits,
  transferCredits,
};

