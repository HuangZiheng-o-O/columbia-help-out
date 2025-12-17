import { collection, addDoc, Timestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './config';

// Sample task data matching Figma design EXACTLY
const sampleTasks = [
  {
    title: 'Borrow Charger 45W',
    shortDescription: 'Need a 45W USB-C charger for my laptop',
    category: 'career',
    credits: 20,
    location: 'Bulter Library lobby',
    durationMinutes: 30,
    status: 'open',
    isVerified: true,
    isOnline: false,
    createdByUid: 'user-1',
    publisherEmail: 'user1@columbia.edu',
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'Advicing',
    shortDescription: 'Need advice on course selection',
    category: 'other',
    credits: 30,
    location: 'My Dorm',
    durationMinutes: 5,
    status: 'open',
    isVerified: true,
    isOnline: false,
    createdByUid: 'user-2',
    publisherEmail: 'user2@columbia.edu',
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'Study for exam',
    shortDescription: 'Looking for study partner for finals',
    category: 'academic',
    credits: 50,
    location: 'Bulter Library lobby',
    durationMinutes: 200,
    status: 'open',
    isVerified: true,
    isOnline: false,
    createdByUid: 'user-3',
    publisherEmail: 'user3@columbia.edu',
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'Help Me with Final',
    shortDescription: 'Need help preparing for CS final exam',
    category: 'daily',
    credits: 90,
    location: 'International Building',
    durationMinutes: 120,
    status: 'open',
    isVerified: true,
    isOnline: false,
    createdByUid: 'user-4',
    publisherEmail: 'user4@columbia.edu',
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
];

/**
 * Seed Firestore with sample tasks
 */
export async function seedTasks() {
  console.log('Starting to seed tasks...');
  const tasksCollection = collection(db, 'tasks');
  
  // Create tasks with specific posted times to match Figma
  const postTimes = [12, 55, 12, 60]; // minutes ago
  
  for (let i = 0; i < sampleTasks.length; i++) {
    const task = sampleTasks[i];
    const minutesAgo = postTimes[i] || 10;
    
    const docData = {
      ...task,
      createdAt: Timestamp.fromDate(new Date(Date.now() - minutesAgo * 60 * 1000)),
      updatedAt: Timestamp.now(),
    };
    
    try {
      const docRef = await addDoc(tasksCollection, docData);
      console.log(`Created task: ${task.title} (${docRef.id})`);
    } catch (error) {
      console.error(`Failed to create task: ${task.title}`, error);
    }
  }
  
  console.log('Seeding complete!');
}

/**
 * Clear all tasks from Firestore
 */
export async function clearTasks() {
  console.log('Clearing all tasks...');
  const tasksCollection = collection(db, 'tasks');
  const snap = await getDocs(tasksCollection);
  
  for (const doc of snap.docs) {
    await deleteDoc(doc.ref);
    console.log(`Deleted task: ${doc.id}`);
  }
  
  console.log('All tasks cleared!');
}

/**
 * Auto-seed tasks if database is empty
 */
export async function autoSeedIfEmpty() {
  const hasSeeded = localStorage.getItem('firebase-seeded-v3');
  if (hasSeeded === 'true') {
    return;
  }

  try {
    const tasksCollection = collection(db, 'tasks');
    const snap = await getDocs(tasksCollection);
    
    if (snap.empty) {
      console.log('Database is empty, seeding initial data...');
      await seedTasks();
      localStorage.setItem('firebase-seeded-v3', 'true');
      console.log('Initial data seeded successfully!');
    } else {
      localStorage.setItem('firebase-seeded-v3', 'true');
    }
  } catch (error) {
    console.error('Error checking/seeding database:', error);
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.seedTasks = seedTasks;
  window.clearTasks = clearTasks;
  window.autoSeedIfEmpty = autoSeedIfEmpty;
}
