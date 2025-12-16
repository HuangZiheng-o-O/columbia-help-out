import { collection, addDoc, Timestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './config';

// Sample task data for seeding Firestore
const sampleTasks = [
  {
    title: 'Borrow 45W USB-C charger',
    shortDescription: 'Need a 45W USB-C charger near Butler',
    category: 'campus',
    credits: 30,
    location: 'Butler Library',
    durationMinutes: 30,
    status: 'open',
    isVerified: true,
    isOnline: false,
    urgency: 'urgent',
    createdByUid: 'mock-user-1',
    publisherEmail: 'jordan@columbia.edu',
    tags: ['butler', 'charger'],
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'Buy a Lunch',
    shortDescription: 'Grab lunch from Ferris Booth Commons',
    category: 'daily',
    credits: 10,
    location: 'Ferris Booth Commons',
    durationMinutes: 20,
    status: 'open',
    isVerified: true,
    isOnline: false,
    urgency: 'normal',
    createdByUid: 'mock-user-1',
    publisherEmail: 'jordan@columbia.edu',
    tags: ['lunch'],
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'Flyer distribution',
    shortDescription: 'Distribute 50 flyers on campus',
    category: 'daily',
    credits: 20,
    location: 'College Walk',
    durationMinutes: 50,
    status: 'open',
    isVerified: true,
    isOnline: false,
    urgency: 'flexible',
    createdByUid: 'mock-user-1',
    publisherEmail: 'jordan@columbia.edu',
    tags: ['flyer'],
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'Study notes sharing',
    shortDescription: 'Share notes for Econ midterm',
    category: 'academic',
    credits: 16,
    location: 'Online',
    durationMinutes: 20,
    status: 'open',
    isVerified: true,
    isOnline: true,
    urgency: 'flexible',
    createdByUid: 'mock-user-1',
    publisherEmail: 'jordan@columbia.edu',
    tags: ['study'],
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'Help pick a package',
    shortDescription: 'Pick a package from package center',
    category: 'campus',
    credits: 15,
    location: 'Package Center',
    durationMinutes: 15,
    status: 'claimed',
    isVerified: true,
    isOnline: false,
    urgency: 'normal',
    createdByUid: 'mock-user-1',
    publisherEmail: 'jordan@columbia.edu',
    tags: ['package'],
    claimedByUid: 'mock-user-2',
    claimedAt: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)),
    completedAt: null,
  },
  {
    title: 'Language exchange',
    shortDescription: '30-min English/Chinese exchange',
    category: 'other',
    credits: 18,
    location: 'Butler Library',
    durationMinutes: 30,
    status: 'open',
    isVerified: true,
    isOnline: false,
    urgency: 'flexible',
    createdByUid: 'mock-user-2',
    publisherEmail: 'li.andy@columbia.edu',
    tags: ['language'],
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'Math study buddy',
    shortDescription: 'Calc III problem review',
    category: 'academic',
    credits: 22,
    location: 'Mudd Building',
    durationMinutes: 45,
    status: 'open',
    isVerified: true,
    isOnline: false,
    urgency: 'normal',
    createdByUid: 'mock-user-2',
    publisherEmail: 'li.andy@columbia.edu',
    tags: ['math'],
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'Event photography',
    shortDescription: 'Take photos at club event',
    category: 'other',
    credits: 60,
    location: 'Low Steps',
    durationMinutes: 90,
    status: 'open',
    isVerified: false,
    isOnline: false,
    urgency: 'urgent',
    createdByUid: 'mock-user-4',
    publisherEmail: 'pat.singh@columbia.edu',
    tags: ['photo'],
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'CS project pairing',
    shortDescription: 'Pair program for 1 hour',
    category: 'academic',
    credits: 32,
    location: 'Online',
    durationMinutes: 60,
    status: 'open',
    isVerified: true,
    isOnline: true,
    urgency: 'normal',
    createdByUid: 'mock-user-5',
    publisherEmail: 'alex.taylor@columbia.edu',
    tags: ['pair-program'],
    claimedByUid: null,
    claimedAt: null,
    completedAt: null,
  },
  {
    title: 'Share class notes',
    shortDescription: 'Send EE class notes PDF',
    category: 'academic',
    credits: 12,
    location: 'Online',
    durationMinutes: 10,
    status: 'completed',
    isVerified: true,
    isOnline: true,
    urgency: 'flexible',
    createdByUid: 'mock-user-1',
    publisherEmail: 'jordan@columbia.edu',
    tags: ['notes'],
    claimedByUid: 'mock-user-2',
    claimedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    completedAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
  },
];

/**
 * Seed Firestore with sample tasks
 * Call this function from browser console or a temporary component
 */
export async function seedTasks(): Promise<void> {
  console.log('Starting to seed tasks...');
  const tasksCollection = collection(db, 'tasks');
  
  for (const task of sampleTasks) {
    const docData = {
      ...task,
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)),
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
 * Clear all tasks from Firestore (use with caution!)
 */
export async function clearTasks(): Promise<void> {
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
 * This runs automatically on first load
 */
export async function autoSeedIfEmpty(): Promise<void> {
  // Check localStorage to avoid checking every time
  const hasSeeded = localStorage.getItem('firebase-seeded');
  if (hasSeeded === 'true') {
    return; // Already seeded before
  }

  try {
    const tasksCollection = collection(db, 'tasks');
    const snap = await getDocs(tasksCollection);
    
    // If database is empty, seed it
    if (snap.empty) {
      console.log('Database is empty, seeding initial data...');
      await seedTasks();
      localStorage.setItem('firebase-seeded', 'true');
      console.log('Initial data seeded successfully!');
    } else {
      // Database has data, mark as seeded
      localStorage.setItem('firebase-seeded', 'true');
    }
  } catch (error) {
    console.error('Error checking/seeding database:', error);
    // Don't block app if seeding fails
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).seedTasks = seedTasks;
  (window as any).clearTasks = clearTasks;
  (window as any).autoSeedIfEmpty = autoSeedIfEmpty;
}

