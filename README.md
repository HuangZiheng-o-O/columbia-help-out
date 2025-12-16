# Columbia Help Out

A React + TypeScript + Vite project for Columbia University students to share and claim tasks.

## Features

- Browse available tasks on campus
- Post new tasks with credits reward
- Claim and complete tasks
- Track your published and claimed tasks
- Real-time data sync with Firebase

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Backend**: Firebase (Firestore + Auth)
- **Styling**: CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (see Firebase Setup below)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd columbia-help-out

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database (test mode for development)
3. Enable Authentication (Email/Password)
4. Get your Firebase config from Project Settings → Your apps
5. Update `src/firebase/config.ts` with your config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Seed Initial Data

After setting up Firebase, open the browser console and run:

```javascript
// Add sample tasks to Firestore
seedTasks()

// Clear all tasks (use with caution)
clearTasks()
```

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/           # Task service (Firestore)
├── firebase/      # Firebase configuration
├── components/    # React components
│   ├── layout/    # Layout components (Sidebar, Header, etc.)
│   └── tasks/     # Task-related components
├── styles/        # CSS styles
├── utils/         # Utility functions
├── App.tsx        # Main app component
└── main.tsx       # Entry point
```

## Firestore Data Model

### `tasks` Collection

| Field | Type | Description |
|-------|------|-------------|
| title | string | Task title |
| shortDescription | string | Brief description |
| category | string | campus/daily/academic/other |
| credits | number | Reward credits |
| location | string | Location description |
| durationMinutes | number | Estimated duration |
| status | string | open/claimed/completed/cancelled |
| createdByUid | string | Publisher's user ID |
| publisherEmail | string | Publisher's email |
| claimedByUid | string | Claimer's user ID |
| createdAt | timestamp | Creation time |
| tags | array | Task tags |

## Development Notes

- Cross-platform compatible (Windows, macOS, Linux)
- Responsive design for desktop and mobile
- Uses Firebase Firestore for real-time data

## License

MIT
