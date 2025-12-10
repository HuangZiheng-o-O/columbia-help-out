# Firebase Backend API Contract for Task Plaza

This document describes the backend API contract expected by the frontend.
It assumes the following Firebase products:

- Firebase Authentication (email/password + optional social providers)
- Cloud Firestore for task storage
- (Optional) Cloud Functions for complex validation and permission logic

The goal is that the frontend only depends on the `TaskService` interface.
As long as the backend respects this contract, the React UI will not need to change.

---

## 1. Firestore Data Model

### 1.1 `tasks` Collection

**Collection name:** `tasks`

Each document represents a task that can be claimed by another user.

**Document ID:** auto-generated (e.g. `taskId`)

**Fields:**

| Field           | Type                                           | Description                               |
|-----------------|------------------------------------------------|-------------------------------------------|
| `title`         | string                                         | Task title                                |
| `shortDescription` | string \| null                             | Short description of the task             |
| `category`      | string (`campus` \| `daily` \| `academic` \| `other`) | Task category                   |
| `credits`       | number                                         | Reward credits (>= 0)                     |
| `location`      | string                                         | Location description                      |
| `durationMinutes` | number                                      | Estimated duration in minutes             |
| `createdAt`     | `Timestamp`                                    | Creation time                             |
| `createdByUid`  | string                                         | Firebase Auth user uid of the creator     |
| `status`        | string (`open` \| `claimed` \| `completed` \| `cancelled`) | Task status                |
| `isVerified`    | boolean                                        | Whether the creator’s email is verified   |
| `isOnline`      | boolean                                        | Whether this is an online task            |
| `urgency`       | string (`urgent` \| `flexible` \| `normal`) \| null | Urgency level                         |
| `tags`          | string[]                                       | Free-form tags                            |
| `claimedByUid`  | string \| null                                 | UID of the user who claimed the task      |
| `claimedAt`     | `Timestamp` \| null                            | Time when the task was claimed            |
| `completedAt`   | `Timestamp` \| null                            | Time when the task was marked completed   |

The fields map 1:1 to the `Task` TypeScript type, except that Firestore
uses `Timestamp` and the frontend uses ISO strings.

---

## 2. `TaskService` Interface (Frontend Contract)

The frontend talks to a `TaskService` interface in TypeScript:

```ts
export interface TaskService {
  listTasks(query: TaskListQuery): Promise<TaskListResult>;
  getTaskById(id: string): Promise<Task | null>;
  // Future extensions:
  // createTask(input: CreateTaskInput): Promise<Task>;
  // claimTask(taskId: string): Promise<Task>;
  // completeTask(taskId: string): Promise<Task>;
}
```

As long as you implement this interface using Firebase, the UI code does not
need to change.

### 2.1 `TaskListQuery` Parameters

```ts
export interface TaskListQuery {
  searchText?: string;
  sortBy?: 'newest' | 'nearest' | 'credits_desc';
  limit?: number;
  cursor?: string;
}
```

- `searchText`: optional free-text search term.
- `sortBy`:
  - `newest`: sort by creation time, newest first.
  - `credits_desc`: sort by credits descending.
  - `nearest`: reserved for future geo-based sorting.
- `limit`: maximum number of tasks to return (default ~20).
- `cursor`: string used for pagination (see below).

### 2.2 `TaskListResult` Structure

```ts
export interface TaskListResult {
  tasks: Task[];
  nextCursor?: string;
}
```

- `tasks`: array of tasks matching the query.
- `nextCursor`: cursor to fetch the next page. If omitted or `undefined`,
  there are no more results.

---

## 3. Implementing `listTasks` with Firestore

A typical Firestore query for “open tasks ordered by newest”:

```ts
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

async function listTasksWithFirestore(queryInput: TaskListQuery): Promise<TaskListResult> {
  const { searchText, sortBy = 'newest', limit: pageSize = 20, cursor } = queryInput;

  const baseRef = collection(db, 'tasks');

  let q: any = query(
    baseRef,
    where('status', '==', 'open'),
  );

  if (sortBy === 'credits_desc') {
    q = query(q, orderBy('credits', 'desc'));
  } else {
    q = query(q, orderBy('createdAt', 'desc'));
  }

  // Example cursor encoding: "<createdAtMillis>_<docId>"
  if (cursor) {
    const [createdAtMillis, docId] = cursor.split('_');
    const createdAt = Timestamp.fromMillis(Number(createdAtMillis));
    // You may also store the last visible document snapshot in a cache
    // instead of encoding it into a cursor string.
    q = query(q, startAfter(createdAt, docId));
  }

  q = query(q, limit(pageSize));

  const snap = await getDocs(q);
  const tasks: Task[] = snap.docs.map((doc) => firestoreDocToTask(doc.id, doc.data()));

  let nextCursor: string | undefined;
  const last = snap.docs[snap.docs.length - 1];
  if (last) {
    const data = last.data() as { createdAt: Timestamp };
    if (data.createdAt) {
      nextCursor = `${data.createdAt.toMillis()}_${last.id}`;
    }
  }

  return { tasks, nextCursor };
}
```

`firestoreDocToTask` should convert Firestore `Timestamp` fields to ISO
strings and ensure the returned object matches the `Task` type.

### 3.1 Search Behavior

For simple implementations, you can ignore `searchText` or apply a basic
client-side filter. For more advanced search, consider:

- Adding Firestore indexes for prefix search on `title`.
- Integrating with an external search service (e.g. Algolia) via Cloud Functions.

---

## 4. Implementing `getTaskById` with Firestore

```ts
import { doc, getDoc } from 'firebase/firestore';

async function getTaskByIdWithFirestore(id: string): Promise<Task | null> {
  const ref = doc(db, 'tasks', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return firestoreDocToTask(snap.id, snap.data());
}
```

---

## 5. Future Extension: Mutating Operations

For future features, you can extend `TaskService` with methods like:

```ts
interface CreateTaskInput {
  title: string;
  shortDescription?: string;
  category: TaskCategory;
  credits: number;
  location: string;
  durationMinutes: number;
  isOnline?: boolean;
  urgency?: TaskUrgency;
  tags?: string[];
}

interface TaskService {
  listTasks(query: TaskListQuery): Promise<TaskListResult>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(input: CreateTaskInput): Promise<Task>;
  claimTask(taskId: string): Promise<Task>;
  completeTask(taskId: string): Promise<Task>;
}
```

These can be implemented either:

1. Directly from the client using Firestore SDK + Security Rules, or  
2. Via HTTPS Cloud Functions endpoints such as:
   - `POST /tasks` (create)
   - `POST /tasks/{id}:claim`
   - `POST /tasks/{id}:complete`

In all cases, make sure the response body matches the `Task` type so the UI
can use it without any extra transformation.
